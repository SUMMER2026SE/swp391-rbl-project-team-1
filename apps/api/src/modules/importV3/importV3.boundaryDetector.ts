import { ExamDocument } from '../importV2/importV2.normalizer.js';

export interface QuestionBoundary {
  questionIndex: number;
  section: string;
  pageStart: number;
  pageEnd: number;
  topYRatio: number;             // Top Y ratio on pageStart (0.0 to 1.0)
  bottomYRatio: number;          // Bottom Y ratio on pageEnd (0.0 to 1.0)
  pageStartBottomYRatio: number; // Bottom Y ratio on pageStart (usually 1.0)
  pageEndTopYRatio: number;      // Top Y ratio on pageEnd (usually 0.0)
  topYPx?: number;
  bottomYPx?: number;
  blockCount: number;
  // Solution / Answer section crop boundaries
  hasAnswerSection?: boolean;
  answerPageStart?: number;
  answerPageEnd?: number;
  answerTopYRatio?: number;
  answerBottomYRatio?: number;
}

export class QuestionBoundaryDetector {
  private static QUESTION_START_REGEX = /^[\s\*\#\_\-]*?(câu|question|bài)\s*([0-9]+|[ivxlcdm]+)[\s.:\)\-]/i;
  private static HEADER_INSTRUCTION_REGEX = /(thí\s+sinh\s+trả\s+lời|từ\s+câu|đến\s+câu|mỗi\s+câu\s+hỏi|phần\s+này\s+có|gồm\s+[0-9]+\s+câu)/i;
  private static ANSWER_SECTION_REGEX = /^(hướng\s+dẫn\s+giải|lời\s+giải\s+chi\s+tiết|đáp\s+án\s+chi\s+tiết|bảng\s+đáp\s+án|phần\s+đáp\s+án|(đ|d)áp\s+án\s+tham\s+khảo|bảng\s+(đ|d)áp\s+án|(đ|d)áp\s+án)/i;

  /**
   * Identifies precise visual Y-coordinate boundaries for every question in sequential order (Question 1..N).
   * Crops strictly from 3px above "Câu n" block to 1px above "Câu n+1" block, filtering out page headers/footers
   * and section title names/instruction blocks.
   */
  static detectBoundaries(examDoc: ExamDocument): QuestionBoundary[] {
    console.log(`[BoundaryDetector V3] 🚀 Locating visual question boundaries via Midpoint Algorithm for "${examDoc.title}"...`);

    const pageHeightMap: Record<number, number> = {};
    examDoc.pages.forEach(p => {
      pageHeightMap[p.page] = p.height || 842.0;
    });

    const mainBlocks: any[] = [];
    const answerBlocks: any[] = [];
    let inAnswerSection = false;

    for (const block of examDoc.allBlocks) {
      const text = typeof block.content === 'string' ? block.content.trim() : '';
      if (this.ANSWER_SECTION_REGEX.test(text)) {
        inAnswerSection = true;
      }

      if (inAnswerSection) {
        answerBlocks.push(block);
      } else {
        mainBlocks.push(block);
      }
    }

    const boundaries = this.extractBoundariesFromBlocks(mainBlocks, pageHeightMap);

    if (answerBlocks.length > 0) {
      console.log(`[BoundaryDetector V3] 💡 Answer section detected (${answerBlocks.length} blocks). Extracting answer crop boundaries...`);
      const answerBoundaries = this.extractBoundariesFromBlocks(answerBlocks, pageHeightMap);

      boundaries.forEach(b => {
        const matchingAns = answerBoundaries.find(a => a.questionIndex === b.questionIndex);
        if (matchingAns) {
          b.hasAnswerSection = true;
          b.answerPageStart = matchingAns.pageStart;
          b.answerPageEnd = matchingAns.pageEnd;
          b.answerTopYRatio = matchingAns.topYRatio;
          b.answerBottomYRatio = matchingAns.bottomYRatio;
        }
      });
    }

    console.log(`[BoundaryDetector V3] ✅ Located ${boundaries.length} sequential question boundaries.`);
    return boundaries;
  }

  private static isQuestionStartLine(text: string): boolean {
    if (!text) return false;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (this.HEADER_INSTRUCTION_REGEX.test(line)) {
        continue;
      }
      if (this.QUESTION_START_REGEX.test(line)) {
        return true;
      }
    }
    return false;
  }

  private static isPageHeaderOrNoise(text: string): boolean {
    if (!text) return true;
    const t = text.trim().toLowerCase();
    return (
      t.includes('thuvienhoclieu') ||
      t.includes('trang ') ||
      t.includes('bộ giáo dục') ||
      t.includes('sở giáo dục') ||
      t.includes('đề chính thức') ||
      /^(phần\s+(i|ii|iii|iv|v)\b)/i.test(t) ||
      /^mã\s+đề/i.test(t) ||
      /^đề\s+thi/i.test(t) ||
      /^thời\s+gian/i.test(t) ||
      /^\s*(-+|_+)\s*hết\s*(-+|_+)\s*$/i.test(t)
    );
  }

  private static isSectionOrInstruction(text: string): boolean {
    if (!text) return false;
    const t = text.trim().toLowerCase();
    return (
      /^(phần\s+(i|ii|iii|iv|v)\b)/i.test(t) ||
      /^(thí\s+sinh\s+trả\s+lời|từ\s+câu|đến\s+câu|mỗi\s+câu\s+hỏi|phần\s+này\s+gồm)/i.test(t) ||
      /^\s*(-+|_+)\s*hết\s*(-+|_+)\s*$/i.test(t)
    );
  }

  private static getPageTopCutoff(blocks: any[], page: number): number {
    const pageBlocks = blocks.filter(b => b.page === page);
    let maxTopNoiseY = 0;
    for (const b of pageBlocks) {
      if (b.bbox && b.bbox[3] < 120) { // Check top 120px of the page
        const text = typeof b.content === 'string' ? b.content.trim() : '';
        if (this.isPageHeaderOrNoise(text)) {
          maxTopNoiseY = Math.max(maxTopNoiseY, b.bbox[3]);
        }
      }
    }
    return maxTopNoiseY > 0 ? maxTopNoiseY + 3 : 0;
  }

  private static getPageBottomCutoff(blocks: any[], page: number, pageHeight: number): number {
    const pageBlocks = blocks.filter(b => b.page === page);
    let minBottomNoiseY = pageHeight;
    for (const b of pageBlocks) {
      if (b.bbox && b.bbox[1] > pageHeight - 80) { // Check bottom 80px of the page
        const text = typeof b.content === 'string' ? b.content.trim() : '';
        if (this.isPageHeaderOrNoise(text)) {
          minBottomNoiseY = Math.min(minBottomNoiseY, b.bbox[1]);
        }
      }
    }
    return minBottomNoiseY < pageHeight ? minBottomNoiseY - 3 : pageHeight;
  }

  private static extractBoundariesFromBlocks(
    blocksList: any[],
    pageHeightMap: Record<number, number>
  ): QuestionBoundary[] {
    const questionHeaderIndices: { headerBlockIdx: number }[] = [];
    let currentSection = 'PART_I';

    for (let i = 0; i < blocksList.length; i++) {
      const block = blocksList[i];
      const text = typeof block.content === 'string' ? block.content.trim() : '';

      if (/phần\s+I\b/i.test(text)) currentSection = 'PART_I';
      else if (/phần\s+II\b/i.test(text)) currentSection = 'PART_II';
      else if (/phần\s+III\b/i.test(text)) currentSection = 'PART_III';

      if (this.isQuestionStartLine(text)) {
        questionHeaderIndices.push({ headerBlockIdx: i });
      }
    }

    const result: QuestionBoundary[] = [];

    for (let h = 0; h < questionHeaderIndices.length; h++) {
      const sequentialIndex = h + 1;
      const current = questionHeaderIndices[h];
      const next = questionHeaderIndices[h + 1];

      const startBlockIdx = current.headerBlockIdx;
      const endBlockIdx = next ? next.headerBlockIdx - 1 : blocksList.length - 1;

      const rawQBlocks = blocksList.slice(startBlockIdx, endBlockIdx + 1);
      if (rawQBlocks.length === 0) continue;

      const pageStart = rawQBlocks[0].page;
      const rawPageEnd = rawQBlocks[rawQBlocks.length - 1].page;

      // Filter out trailing noise blocks on rawPageEnd to detect true pageEnd
      let actualPageEnd = pageStart;
      if (rawPageEnd > pageStart) {
        const nextPageBlocks = rawQBlocks.filter(b => b.page > pageStart);
        const hasRealContentOnNextPage = nextPageBlocks.some(b => {
          const contentStr = typeof b.content === 'string' ? b.content : '';
          return !this.isPageHeaderOrNoise(contentStr);
        });

        if (hasRealContentOnNextPage) {
          actualPageEnd = rawPageEnd;
        }
      }

      const qBlocks = rawQBlocks.filter(b => b.page <= actualPageEnd);

      const startBlock = qBlocks[0];
      const rawTopY = startBlock.bbox ? startBlock.bbox[1] : 0;
      
      const pageTopCut = this.getPageTopCutoff(blocksList, pageStart);
      // Safe Guard: If pageTopCut overlaps with or is below the question itself, ignore pageTopCut
      // Set to rawTopY - 3 for safety top padding
      const topYPx = Math.max(pageTopCut >= rawTopY ? 0 : pageTopCut, rawTopY - 3);

      let bottomYPx: number;
      let pageStartBottomYRatio = 1.0;
      let pageEndTopYRatio = 0.0;

      if (pageStart === actualPageEnd) {
        // Single Page Question
        if (next && blocksList[next.headerBlockIdx].page === pageStart) {
          // Cut right above next question's header line (with tight 1px margin)
          // Also check for section dividers or instruction headers in between
          const betweenBlocks = blocksList.slice(current.headerBlockIdx + 1, next.headerBlockIdx);
          const firstSectionOrInstruction = betweenBlocks.find(b => {
            const txt = typeof b.content === 'string' ? b.content.trim() : '';
            return this.isSectionOrInstruction(txt);
          });

          if (firstSectionOrInstruction && firstSectionOrInstruction.bbox) {
            bottomYPx = Math.max(topYPx + 20, firstSectionOrInstruction.bbox[1] - 1);
          } else {
            const nextTopY = blocksList[next.headerBlockIdx].bbox ? blocksList[next.headerBlockIdx].bbox[1] : 842.0;
            bottomYPx = Math.max(topYPx + 20, nextTopY - 1);
          }
        } else {
          // Last question on this page: crop to the page bottom cutoff + 6px padding
          const pageStartHeight = pageHeightMap[pageStart] || 842.0;
          const endCut = this.getPageBottomCutoff(blocksList, pageStart, pageStartHeight);
          bottomYPx = Math.min(pageStartHeight, endCut + 6);
        }
      } else {
        // Multi-page Spanning Question (pageStart !== actualPageEnd)
        const pageStartHeight = pageHeightMap[pageStart] || 842.0;
        const pageStartBottomY = this.getPageBottomCutoff(blocksList, pageStart, pageStartHeight);
        pageStartBottomYRatio = Math.min(pageStartHeight, pageStartBottomY + 6) / pageStartHeight;

        const pageEndHeight = pageHeightMap[actualPageEnd] || 842.0;
        const pageEndTopY = this.getPageTopCutoff(blocksList, actualPageEnd);
        pageEndTopYRatio = Math.max(0, pageEndTopY - 3) / pageEndHeight;

        if (next && blocksList[next.headerBlockIdx].page === actualPageEnd) {
          const nextPageStartIndex = blocksList.findIndex(b => b.page === actualPageEnd);
          const betweenBlocks = blocksList.slice(nextPageStartIndex, next.headerBlockIdx);
          const firstSectionOrInstruction = betweenBlocks.find(b => {
            const txt = typeof b.content === 'string' ? b.content.trim() : '';
            return this.isSectionOrInstruction(txt);
          });

          if (firstSectionOrInstruction && firstSectionOrInstruction.bbox) {
            bottomYPx = Math.max(pageEndTopY + 20, firstSectionOrInstruction.bbox[1] - 1);
          } else {
            const nextTopY = blocksList[next.headerBlockIdx].bbox ? blocksList[next.headerBlockIdx].bbox[1] : pageEndHeight;
            bottomYPx = Math.max(pageEndTopY + 20, nextTopY - 1);
          }
        } else {
          const pageEndBottomY = this.getPageBottomCutoff(blocksList, actualPageEnd, pageEndHeight);
          bottomYPx = Math.min(pageEndHeight, pageEndBottomY + 6);
        }
      }

      const pHeightStart = pageHeightMap[pageStart] || 842.0;
      const pHeightEnd = pageHeightMap[actualPageEnd] || 842.0;

      const topYRatio = Math.max(0, Math.min(1, topYPx / pHeightStart));
      const bottomYRatio = Math.max(0, Math.min(1, bottomYPx / pHeightEnd));

      result.push({
        questionIndex: sequentialIndex,
        section: currentSection,
        pageStart,
        pageEnd: actualPageEnd,
        topYRatio,
        bottomYRatio,
        pageStartBottomYRatio,
        pageEndTopYRatio,
        topYPx,
        bottomYPx,
        blockCount: qBlocks.length
      });
    }

    return result;
  }
}
