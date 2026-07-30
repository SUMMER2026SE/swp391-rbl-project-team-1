import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma.js';
import { ImportV2Repository } from '../importV2/importV2.repository.js';
import { MineruService } from '../../services/mineru.service.js';
import { DocumentNormalizer } from '../importV2/importV2.normalizer.js';
import { QuestionBoundaryDetector } from './importV3.boundaryDetector.js';
import { QuestionCropGenerator } from './importV3.cropGenerator.js';
import { GeminiVisionService } from './importV3.vision.js';

export class ImportV3Service {
  private static artifactsCacheV3 = new Map<number, any>();

  private static getArtifactFile(sessionId: number): string {
    const rootDir = path.resolve(process.cwd(), '..', '..');
    const dir = path.join(rootDir, 'scratch', 'crops', `session_${sessionId}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, 'artifacts.json');
  }

  private static saveArtifacts(sessionId: number, artifacts: any) {
    try {
      this.artifactsCacheV3.set(sessionId, artifacts);
      const filePath = this.getArtifactFile(sessionId);
      fs.writeFileSync(filePath, JSON.stringify(artifacts, null, 2), 'utf-8');
    } catch (e) {
      console.warn(`[ImportV3] Failed to save artifacts cache for session ${sessionId}:`, e);
    }
  }

  private static loadArtifacts(sessionId: number): any {
    return this.loadArtifactsFromDisk(sessionId);
  }

  private static loadArtifactsFromDisk(sessionId: number): any {
    if (this.artifactsCacheV3.has(sessionId)) {
      return this.artifactsCacheV3.get(sessionId);
    }
    try {
      const filePath = this.getArtifactFile(sessionId);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        this.artifactsCacheV3.set(sessionId, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`[ImportV3] Failed to read artifacts cache for session ${sessionId}:`, e);
    }
    return {};
  }

  static async createSessionV3(userId: number, fileName: string, fileSize: number, filePath?: string) {
    const session = await ImportV2Repository.createSession(userId, fileName, fileSize, filePath);
    this.runBackgroundPipelineV3(session.id, filePath || '', fileName, userId);
    return session;
  }

  static async getSessionByIdV3(id: number, userId: number, userRole?: string) {
    const session = await ImportV2Repository.getSessionById(id);
    if (!session) throw new Error('NOT_FOUND: Phiên nhập đề Import V3 không tồn tại!');
    if (userRole !== 'ADMIN' && session.userId !== userId) throw new Error('FORBIDDEN: Bạn không có quyền truy cập phiên này!');

    const cachedArtifacts = this.loadArtifactsFromDisk(id);
    const mediaObj = typeof (session as any).media === 'object' && (session as any).media !== null ? (session as any).media : {};

    return {
      ...session,
      media: {
        ...mediaObj,
        pipelineArtifactsV3: cachedArtifacts
      }
    };
  }

  static async recropQuestionV3(
    sessionId: number,
    userId: number,
    questionIndex: number,
    topYRatio: number,
    bottomYRatio: number,
    pageStart: number,
    pageEnd: number,
    pageStartBottomYRatio?: number,
    pageEndTopYRatio?: number
  ) {
    const session = await ImportV2Repository.getSessionById(sessionId);
    if (!session) throw new Error('NOT_FOUND: Phiên nhập đề không tồn tại!');
    if (session.userId !== userId) throw new Error('FORBIDDEN: Không có quyền truy cập!');

    let cachedArtifacts = this.loadArtifactsFromDisk(sessionId);
    if (!cachedArtifacts.boundaries) {
      cachedArtifacts.boundaries = [];
    }

    let b = cachedArtifacts.boundaries.find((x: any) => x.questionIndex === questionIndex);
    if (!b) {
      b = {
        questionIndex,
        section: 'PART_I',
        pageStart,
        pageEnd,
        topYRatio,
        bottomYRatio,
        pageStartBottomYRatio: pageStartBottomYRatio !== undefined ? pageStartBottomYRatio : 1.0,
        pageEndTopYRatio: pageEndTopYRatio !== undefined ? pageEndTopYRatio : 0.0,
        blockCount: 1
      };
      cachedArtifacts.boundaries.push(b);
    } else {
      b.topYRatio = topYRatio;
      b.bottomYRatio = bottomYRatio;
      b.pageStart = pageStart;
      b.pageEnd = pageEnd;
      if (pageStartBottomYRatio !== undefined) b.pageStartBottomYRatio = pageStartBottomYRatio;
      if (pageEndTopYRatio !== undefined) b.pageEndTopYRatio = pageEndTopYRatio;
    }

    const rootDir = path.resolve(process.cwd(), '..', '..');
    const pageImagesDir = path.join(rootDir, 'tools', 'mineru', 'output', 'extracted_images');
    QuestionCropGenerator.recropSingleQuestion(sessionId, b, pageImagesDir);

    const importQuestions = await prisma.importQuestion.findMany({
      where: { sessionId }
    });
    const dbQ = importQuestions.find(q => q.questionOrder === questionIndex);
    if (dbQ) {
      const media = typeof dbQ.media === 'object' && dbQ.media !== null ? { ...dbQ.media } : {};
      await prisma.importQuestion.update({
        where: { id: dbQ.id },
        data: {
          media: {
            ...media,
            cropImagePath: `scratch/crops/session_${sessionId}/q_${questionIndex}.png`
          }
        }
      });
    }

    this.saveArtifacts(sessionId, cachedArtifacts);
    return { success: true };
  }

  /**
   * Import V3 Architecture (Image First Pipeline):
   * Upload -> MinerU (Render Page Images) -> Boundary Detector -> Crop Generator -> Gemini Vision API -> Review Studio V3
   */
  static async runBackgroundPipelineV3(sessionId: number, filePath: string, fileName: string, userId: number) {
    const pipelineArtifactsV3: any = {};

    try {
      await ImportV2Repository.createLog(sessionId, 'INFO', `🚀 Step 1 [Import V3]: Initializing Image-First Pipeline for: ${fileName}`);

      // STEP 2: MinerU Render Page Images & Layout
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Step 2 [Import V3]: Rendering high-resolution page images via MinerU...');
      const startTimeMineru = Date.now();
      const mineruJson = await MineruService.parseDocument(filePath, fileName);
      const mineruTime = Date.now() - startTimeMineru;
      pipelineArtifactsV3.mineruJson = mineruJson;
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Step 2 Complete: MinerU rendered ${mineruJson.pages?.length || 1} page images in ${mineruTime}ms.`);

      const examDocument = DocumentNormalizer.normalize(mineruJson);
      pipelineArtifactsV3.examDocument = examDocument;

      // STEP 2.5: Full Document Pre-Analysis AI (Bảng đáp án, Lời giải chi tiết, Môn học, Chủ đề)
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Step 2.5 [Import V3]: Phân tích toàn bộ đề thi bằng AI (Tìm Bảng đáp án & Lời giải chi tiết)...');
      const dbSubjects = await prisma.subject.findMany({
        include: { topics: true }
      });

      const startTimeAnalysis = Date.now();
      const globalAnalysis = await GeminiVisionService.analyzeFullDocument(examDocument, dbSubjects);
      const analysisTime = Date.now() - startTimeAnalysis;
      pipelineArtifactsV3.globalAnalysis = globalAnalysis;
      await ImportV2Repository.createLog(
        sessionId,
        'INFO',
        `✅ Step 2.5 Complete: Phân tích đề hoàn tất trong ${analysisTime}ms (Tìm thấy ${Object.keys(globalAnalysis.answerKey).length} đáp án & ${Object.keys(globalAnalysis.explanations).length} lời giải chi tiết. Môn: ${globalAnalysis.subject}).`
      );

      // STEP 3: Question Boundary Detector (Visual Y-Coordinates)
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Step 3 [Import V3]: Locating visual question boundaries (Boundary Detector)...');
      const startTimeBound = Date.now();
      const boundaries = QuestionBoundaryDetector.detectBoundaries(examDocument);
      const boundTime = Date.now() - startTimeBound;
      pipelineArtifactsV3.boundaries = boundaries;
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Step 3 Complete: Located ${boundaries.length} visual boundaries in ${boundTime}ms.`);

      // STEP 4: Question Crop Generator (PNG Crops & Stitching)
      await ImportV2Repository.createLog(sessionId, 'INFO', 'Step 4 [Import V3]: Cropping question images (Crop Generator)...');
      const rootDir = path.resolve(process.cwd(), '..', '..');
      const pageImagesDir = path.join(rootDir, 'tools', 'mineru', 'output', 'extracted_images');
      
      const startTimeCrop = Date.now();
      const crops = QuestionCropGenerator.generateCrops(sessionId, boundaries, pageImagesDir);
      const cropTime = Date.now() - startTimeCrop;
      pipelineArtifactsV3.crops = crops;
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Step 4 Complete: Cropped ${crops.length} question images in ${cropTime}ms.`);

      // STEP 5: Gemini Vision API Processing with Pre-Analysis Enrichment & Section Mapping
      await ImportV2Repository.createLog(sessionId, 'INFO', `Step 5 [Import V3]: Sending ${crops.length} question crops to Gemini 2.5 Flash Vision...`);
      const startTimeVision = Date.now();
      
      const sectionsMap: Record<number, string> = {};
      crops.forEach(c => {
        sectionsMap[c.questionIndex] = c.section || 'PART_I';
      });

      const visionOutputs = await GeminiVisionService.processAllQuestionCrops(crops, sectionsMap, globalAnalysis, dbSubjects);
      const visionTime = Date.now() - startTimeVision;
      pipelineArtifactsV3.visionOutputs = visionOutputs;
      await ImportV2Repository.createLog(sessionId, 'INFO', `✅ Step 5 Complete: Gemini Vision extracted ${visionOutputs.length} questions in ${visionTime}ms.`);


      // STEP 6: Save ImportQuestions to DB
      const resolvedSubject = globalAnalysis?.subject || 'Toán học';
      const resolvedTopic = globalAnalysis?.topic || 'Chủ đề tổng hợp';

      const allQuestions: any[] = visionOutputs.map(vo => {
        const itemSubject = vo.subject || resolvedSubject;
        const itemTopic = vo.topic || resolvedTopic;
        return {
          content: vo.content,
          options: vo.options,
          correctAnswer: vo.correctAnswer || 'A',
          explanation: vo.explanation || '',
          difficulty: vo.difficulty || globalAnalysis?.defaultDifficulty || 'MEDIUM',
          status: 'OK',
          type: vo.type,
          section: vo.section || 'PHẦN I',
          questionOrder: vo.questionIndex,
          media: {
            cropImagePath: vo.cropImagePath,
            hasDiagram: vo.hasDiagram,
            hasTable: vo.hasTable,
            latexFormulas: vo.latexFormulas,
            subject: itemSubject,
            topic: itemTopic
          }
        };
      });


      pipelineArtifactsV3.questionGraph = allQuestions;
      this.saveArtifacts(sessionId, pipelineArtifactsV3);

      await ImportV2Repository.createImportQuestions(sessionId, allQuestions);
      await ImportV2Repository.updateSession(sessionId, { status: 'REVIEWING' });
      await ImportV2Repository.createLog(sessionId, 'INFO', `Step 7 [Import V3]: ✅ Teacher Review Studio V3 initialized successfully!`);
    } catch (err: any) {
      console.error('[ImportV3 Pipeline Error]', err);
      this.saveArtifacts(sessionId, pipelineArtifactsV3);
      const exists = await prisma.importSession.findUnique({ where: { id: sessionId } });
      if (exists) {
        await ImportV2Repository.updateSession(sessionId, { status: 'FAILED' });
        await ImportV2Repository.createLog(sessionId, 'ERROR', 'Tiến trình Import V3 thất bại!', err.message);
      }
    }
  }

  static async uploadExplanationImageV3(
    sessionId: number,
    userId: number,
    questionIndex: number,
    tempFilePath: string,
    originalName: string
  ) {
    const session = await ImportV2Repository.getSessionById(sessionId);
    if (!session) throw new Error('NOT_FOUND: Phiên nhập đề không tồn tại!');
    if (session.userId !== userId) throw new Error('FORBIDDEN: Không có quyền truy cập!');

    // Find the draft question inside this session
    const importQuestions = await prisma.importQuestion.findMany({
      where: { sessionId }
    });
    const dbQ = importQuestions.find(q => q.questionOrder === questionIndex);
    if (!dbQ) throw new Error('NOT_FOUND: Không tìm thấy câu hỏi tương ứng trong phiên!');

    // Generate path for the explanation image: scratch/crops/session_${sessionId}/explanation_${questionIndex}.png
    const rootDir = path.resolve(process.cwd(), '..', '..');
    const cropsDir = path.join(rootDir, 'apps', 'api', 'scratch', 'crops', `session_${sessionId}`);
    
    // Ensure directory exists
    if (!fs.existsSync(cropsDir)) {
      fs.mkdirSync(cropsDir, { recursive: true });
    }

    const fileExt = path.extname(originalName) || '.png';
    const explanationFileName = `explanation_${questionIndex}${fileExt}`;
    const destinationPath = path.join(cropsDir, explanationFileName);

    // Move the file from temp folder to destination
    fs.renameSync(tempFilePath, destinationPath);

    // Update the question's media JSON field in database
    const media = typeof dbQ.media === 'object' && dbQ.media !== null ? { ...dbQ.media } : {};
    const relativeImagePath = `scratch/crops/session_${sessionId}/${explanationFileName}`;
    
    await prisma.importQuestion.update({
      where: { id: dbQ.id },
      data: {
        media: {
          ...media,
          explanationImagePath: relativeImagePath
        }
      }
    });

    return {
      success: true,
      explanationImagePath: relativeImagePath
    };
  }
}
