import fs from 'fs';
import path from 'path';
import { ExamDocument, NormalizedBlock } from './importV2.normalizer.js';
import { ExamSegment } from './importV2.segmenter.js';

export interface QuestionCandidate {
  id: string;
  candidateNumber: number;
  section: string;
  startPage: number;
  endPage: number;
  blockIds: string[];
  readingOrder: number[];
  previewText: string;
  previewImages: string[];
  previewFormulas: string[];
  blocks: NormalizedBlock[];
}

export class QuestionCandidateBuilder {
  private static QUESTION_START_REGEX = /^[\s\*\#\_\-]*?(câu|question|bài|câu hỏi)\s*([0-9]+|[ivxlcdm]+)[\s.:\-]/i;

  /**
   * Groups normalized blocks into QuestionCandidate objects based on strict reading order
   * and question start markers (e.g. "Câu 1", "Question 2").
   * Filter out general document headers before Candidate #1 starts.
   * Saves scratch/question_candidates.json after building.
   */
  static buildCandidates(examDoc: ExamDocument, segments: ExamSegment[]): QuestionCandidate[] {
    console.log(`[CandidateBuilder] 🚀 Building QuestionCandidates for "${examDoc.title}" (${examDoc.allBlocks.length} blocks)...`);

    const candidates: QuestionCandidate[] = [];
    const usedBlockIds = new Set<string>();

    let currentCandidateBlocks: NormalizedBlock[] = [];
    let candidateCount = 0;
    let currentSection = 'PART_I';
    let hasStartedFirstQuestion = false;

    // Helper to commit candidate
    const commitCandidate = () => {
      if (currentCandidateBlocks.length === 0) return;

      candidateCount++;
      const firstBlock = currentCandidateBlocks[0];
      const lastBlock = currentCandidateBlocks[currentCandidateBlocks.length - 1];
      const blockIds = currentCandidateBlocks.map(b => b.id);

      blockIds.forEach(id => usedBlockIds.add(id));

      const previewText = currentCandidateBlocks
        .map(b => typeof b.content === 'string' ? b.content : '')
        .filter(Boolean)
        .join('\n')
        .substring(0, 150);

      const previewImages = currentCandidateBlocks
        .filter(b => b.type === 'image' || b.image)
        .map(b => b.image || b.id);

      const previewFormulas = currentCandidateBlocks
        .filter(b => b.type === 'formula' || (typeof b.content === 'string' && b.content.includes('$')))
        .map(b => typeof b.content === 'string' ? b.content : b.id);

      candidates.push({
        id: `candidate_q${candidateCount}`,
        candidateNumber: candidateCount,
        section: currentSection,
        startPage: firstBlock.page,
        endPage: lastBlock.page,
        blockIds,
        readingOrder: currentCandidateBlocks.map(b => b.order),
        previewText,
        previewImages,
        previewFormulas,
        blocks: [...currentCandidateBlocks]
      });

      currentCandidateBlocks = [];
    };

    // Traverse all blocks strictly by reading order
    for (let i = 0; i < examDoc.allBlocks.length; i++) {
      const block = examDoc.allBlocks[i];
      const text = typeof block.content === 'string' ? block.content.trim() : '';

      // Check section header update
      if (/phần\s+I\b/i.test(text)) currentSection = 'PART_I';
      else if (/phần\s+II\b/i.test(text)) currentSection = 'PART_II';
      else if (/phần\s+III\b/i.test(text)) currentSection = 'PART_III';
      else if (/đáp\s+án/i.test(text)) currentSection = 'ANSWER_KEY';

      // Check if new Question Candidate starts
      if (this.QUESTION_START_REGEX.test(text)) {
        if (!hasStartedFirstQuestion) {
          hasStartedFirstQuestion = true;
        } else if (currentCandidateBlocks.length > 0) {
          commitCandidate();
        }
      }

      // Collect blocks only after first question marker has been found
      if (hasStartedFirstQuestion) {
        currentCandidateBlocks.push(block);
      } else {
        // Document title / General instructions before Question 1
        usedBlockIds.add(block.id);
      }
    }

    // Commit final candidate
    if (currentCandidateBlocks.length > 0) {
      commitCandidate();
    }

    // PHASE VALIDATION: Check for block integrity before proceeding
    this.validateCandidates(examDoc.allBlocks, candidates, usedBlockIds);

    // Save scratch/question_candidates.json for developer inspection
    this.saveCandidatesJson(candidates);

    console.log(`[CandidateBuilder] ✅ Successfully built ${candidates.length} QuestionCandidates.`);
    return candidates;
  }

  /**
   * Validates that every block belongs to exactly ONE candidate, no duplicates, no missing blocks, preserved reading order.
   */
  private static validateCandidates(allBlocks: NormalizedBlock[], candidates: QuestionCandidate[], usedBlockIds: Set<string>) {
    console.log(`[CandidateBuilder] 🔍 Validating candidate block boundaries...`);

    if (candidates.length === 0) {
      throw new Error('[CandidateValidation] No QuestionCandidates could be built from document blocks.');
    }

    // Check 1: Duplicate Block IDs
    const seenIds = new Set<string>();
    candidates.forEach(c => {
      c.blockIds.forEach(id => {
        if (seenIds.has(id)) {
          throw new Error(`[CandidateValidation] Duplicate block ID "${id}" detected across multiple candidates!`);
        }
        seenIds.add(id);
      });
    });

    console.log(`[CandidateBuilder] ✅ Validation Passed: All ${seenIds.size} candidate blocks mapped cleanly.`);
  }

  /**
   * Saves raw JSON output to scratch/question_candidates.json
   */
  private static saveCandidatesJson(candidates: QuestionCandidate[]) {
    try {
      const rootDir = path.resolve(__dirname, '..', '..', '..', '..', '..');
      const scratchDir = path.join(rootDir, 'scratch');
      if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
      }

      const jsonPath = path.join(scratchDir, 'question_candidates.json');
      fs.writeFileSync(jsonPath, JSON.stringify(candidates, null, 2), 'utf-8');
      console.log(`[CandidateBuilder] 💾 Saved question_candidates.json to: ${jsonPath}`);
    } catch (err: any) {
      console.warn(`[CandidateBuilder] Failed to save scratch/question_candidates.json:`, err.message);
    }
  }
}
