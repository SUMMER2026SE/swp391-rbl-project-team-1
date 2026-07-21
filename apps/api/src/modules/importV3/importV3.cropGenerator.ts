import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { QuestionBoundary } from './importV3.boundaryDetector.js';

export interface CroppedQuestionManifest {
  questionIndex: number;
  cropPath: string;
  relativeCropPath: string;
  cropFilename: string;
  pageStart: number;
  pageEnd: number;
}

export class QuestionCropGenerator {
  /**
   * Crops high-res page PNGs for each question boundary.
   * Multi-page questions spanning pages are vertically stitched.
   * Saves crops in scratch/crops/session_{sessionId}/
   */
  static generateCrops(
    sessionId: number,
    boundaries: QuestionBoundary[],
    pageImagesDir: string
  ): CroppedQuestionManifest[] {
    console.log(`[CropGenerator V3] ✂️ Cropping ${boundaries.length} question images for session #${sessionId}...`);

    const rootDir = path.resolve(process.cwd(), '..', '..');
    const outputDir = path.join(rootDir, 'scratch', 'crops', `session_${sessionId}`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save temporary boundaries JSON for Python crop engine
    const tempBoundariesPath = path.join(outputDir, 'boundaries_temp.json');
    fs.writeFileSync(tempBoundariesPath, JSON.stringify(boundaries, null, 2), 'utf-8');

    const pythonExe = path.join(rootDir, 'mineru-env', 'Scripts', 'python.exe');
    const pythonExeFallback = 'python';
    const cropEnginePy = path.join(rootDir, 'tools', 'mineru', 'crop_engine.py');

    const exeToUse = fs.existsSync(pythonExe) ? `"${pythonExe}"` : pythonExeFallback;

    try {
      const cmd = `${exeToUse} "${cropEnginePy}" "${pageImagesDir}" "${tempBoundariesPath}" "${outputDir}"`;
      console.log(`[CropGenerator V3] Executing Python crop command: ${cmd}`);
      execSync(cmd, { cwd: rootDir, encoding: 'utf-8' });
    } catch (err: any) {
      console.warn(`[CropGenerator V3] Python crop execution warning: ${err.message}. Generating NodeJS fallback manifest...`);
      return this.generateFallbackManifest(sessionId, boundaries, outputDir);
    }

    const manifestPath = path.join(outputDir, 'crops_manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifestRaw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as any[];
      const manifest: CroppedQuestionManifest[] = manifestRaw.map(m => ({
        ...m,
        cropPath: `scratch/crops/session_${sessionId}/${m.cropFilename}`,
        relativeCropPath: `scratch/crops/session_${sessionId}/${m.cropFilename}`
      }));
      console.log(`[CropGenerator V3] ✅ Successfully generated ${manifest.length} question crop images.`);
      return manifest;
    }

    return this.generateFallbackManifest(sessionId, boundaries, outputDir);
  }

  /**
   * Recrops a single question boundary on-the-fly when adjusted by the teacher.
   */
  static recropSingleQuestion(
    sessionId: number,
    boundary: QuestionBoundary,
    pageImagesDir: string
  ): void {
    const rootDir = path.resolve(process.cwd(), '..', '..');
    const outputDir = path.join(rootDir, 'scratch', 'crops', `session_${sessionId}`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const tempBoundariesPath = path.join(outputDir, 'recrop_temp.json');
    fs.writeFileSync(tempBoundariesPath, JSON.stringify([boundary], null, 2), 'utf-8');

    const pythonExe = path.join(rootDir, 'mineru-env', 'Scripts', 'python.exe');
    const pythonExeFallback = 'python';
    const cropEnginePy = path.join(rootDir, 'tools', 'mineru', 'crop_engine.py');
    const exeToUse = fs.existsSync(pythonExe) ? `"${pythonExe}"` : pythonExeFallback;

    try {
      const cmd = `${exeToUse} "${cropEnginePy}" "${pageImagesDir}" "${tempBoundariesPath}" "${outputDir}"`;
      console.log(`[CropGenerator V3] Executing Python single question recrop command: ${cmd}`);
      execSync(cmd, { cwd: rootDir, encoding: 'utf-8' });
    } catch (err: any) {
      console.error(`[CropGenerator V3] Python single recrop execution error: ${err.message}`);
      throw err;
    } finally {
      try {
        if (fs.existsSync(tempBoundariesPath)) {
          fs.unlinkSync(tempBoundariesPath);
        }
      } catch {}
    }
  }

  private static generateFallbackManifest(sessionId: number, boundaries: QuestionBoundary[], outputDir: string): CroppedQuestionManifest[] {
    return boundaries.map(b => {
      const cropFilename = `q_${b.questionIndex}.png`;
      const cropPath = path.join(outputDir, cropFilename);
      const relativeCropPath = `scratch/crops/session_${sessionId}/${cropFilename}`;
      return {
        questionIndex: b.questionIndex,
        cropPath,
        relativeCropPath,
        cropFilename,
        pageStart: b.pageStart,
        pageEnd: b.pageEnd
      };
    });
  }
}
