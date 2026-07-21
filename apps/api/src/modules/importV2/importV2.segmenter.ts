import { ExamDocument, NormalizedBlock } from './importV2.normalizer.js';

export interface ExamBatch {
  id: string;
  segmentId: string;
  batchIndex: number;
  questionHintCount: number;
  blocks: NormalizedBlock[];
}

export interface ExamSegment {
  id: string;
  title: string;
  sectionType: 'PART_I' | 'PART_II' | 'PART_III' | 'ESSAY' | 'ANSWER_KEY' | 'GENERAL';
  blocks: NormalizedBlock[];
  batches: ExamBatch[];
}

export class ExamSegmenter {
  private static MAX_BLOCKS_PER_BATCH = 20;

  /**
   * Splits an ExamDocument into logical segments (PHẦN I, PHẦN II, PHẦN III, etc.)
   * and splits large segments into parallel execution batches.
   */
  static segment(doc: ExamDocument): ExamSegment[] {
    const segments: ExamSegment[] = [];
    let currentSegmentBlocks: NormalizedBlock[] = [];
    let currentSegmentTitle = 'GENERAL';
    let currentSectionType: ExamSegment['sectionType'] = 'GENERAL';
    let segmentCounter = 1;

    const saveCurrentSegment = () => {
      if (currentSegmentBlocks.length === 0) return;

      const segmentId = `seg_${segmentCounter++}_${currentSectionType.toLowerCase()}`;
      const batches = this.createBatches(segmentId, currentSegmentBlocks);

      segments.push({
        id: segmentId,
        title: currentSegmentTitle,
        sectionType: currentSectionType,
        blocks: [...currentSegmentBlocks],
        batches
      });

      currentSegmentBlocks = [];
    };

    for (const block of doc.allBlocks) {
      if (block.type === 'text' && typeof block.content === 'string') {
        const textUpper = block.content.toUpperCase();

        // Detect section headers
        if (textUpper.includes('PHẦN I') || textUpper.includes('PART I') || textUpper.includes('TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN')) {
          saveCurrentSegment();
          currentSegmentTitle = 'PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn';
          currentSectionType = 'PART_I';
        } else if (textUpper.includes('PHẦN II') || textUpper.includes('PART II') || textUpper.includes('TRẮC NGHIỆM ĐÚNG SAI')) {
          saveCurrentSegment();
          currentSegmentTitle = 'PHẦN II. Câu trắc nghiệm đúng sai';
          currentSectionType = 'PART_II';
        } else if (textUpper.includes('PHẦN III') || textUpper.includes('PART III') || textUpper.includes('TRẢ LỜI NGẮN')) {
          saveCurrentSegment();
          currentSegmentTitle = 'PHẦN III. Câu trắc nghiệm trả lời ngắn';
          currentSectionType = 'PART_III';
        } else if (textUpper.includes('BẢNG ĐÁP ÁN') || textUpper.includes('ANSWER SHEET')) {
          saveCurrentSegment();
          currentSegmentTitle = 'BẢNG ĐÁP ÁN';
          currentSectionType = 'ANSWER_KEY';
        }
      }

      currentSegmentBlocks.push(block);
    }

    saveCurrentSegment();
    return segments;
  }

  /**
   * Splits segment blocks into smaller parallel processing batches based on block count
   * and question start hints ("Câu 1", "Câu 2", etc.).
   */
  private static createBatches(segmentId: string, blocks: NormalizedBlock[]): ExamBatch[] {
    const batches: ExamBatch[] = [];
    let currentBatchBlocks: NormalizedBlock[] = [];
    let hintCount = 0;
    let batchIndex = 1;

    for (const b of blocks) {
      if (b.type === 'text' && typeof b.content === 'string') {
        const isQuestionStart = /^câu\s+\d+/i.test(b.content.trim()) || /^question\s+\d+/i.test(b.content.trim()) || /^q\.\d+/i.test(b.content.trim());
        if (isQuestionStart) {
          hintCount++;
          // Split batch if block limit reached or question count exceeds limit
          if (currentBatchBlocks.length >= this.MAX_BLOCKS_PER_BATCH || hintCount > 4) {
            batches.push({
              id: `${segmentId}_batch_${batchIndex++}`,
              segmentId,
              batchIndex: batchIndex - 1,
              questionHintCount: hintCount - 1,
              blocks: [...currentBatchBlocks]
            });
            currentBatchBlocks = [];
            hintCount = 1;
          }
        }
      }

      currentBatchBlocks.push(b);
    }

    if (currentBatchBlocks.length > 0) {
      batches.push({
        id: `${segmentId}_batch_${batchIndex}`,
        segmentId,
        batchIndex,
        questionHintCount: Math.max(hintCount, 1),
        blocks: currentBatchBlocks
      });
    }

    return batches;
  }
}
