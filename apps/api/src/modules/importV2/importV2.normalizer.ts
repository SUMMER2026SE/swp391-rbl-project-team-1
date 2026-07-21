import { MineruDocumentJSON } from '../../services/mineru.service.js';

export interface NormalizedBlock {
  id: string;
  page: number;
  order: number;
  type: 'text' | 'image' | 'formula' | 'table';
  bbox: number[];
  content?: string | any[];
  image?: string;
}

export interface ExamDocumentPage {
  page: number;
  width: number;
  height: number;
  blocks: NormalizedBlock[];
}

export interface ExamDocument {
  title: string;
  pages: ExamDocumentPage[];
  allBlocks: NormalizedBlock[];
  blockMap: Record<string, NormalizedBlock>;
}

export class DocumentNormalizer {
  /**
   * Converts raw MinerU response JSON into a normalized ExamDocument structure.
   * Assigns sequential global order and indexes every block for fast O(1) lookup.
   */
  static normalize(mineruJson: MineruDocumentJSON): ExamDocument {
    const title = mineruJson.title || 'Untitled Exam Document';
    const pages: ExamDocumentPage[] = [];
    const allBlocks: NormalizedBlock[] = [];
    const blockMap: Record<string, NormalizedBlock> = {};

    let globalOrder = 1;

    if (Array.isArray(mineruJson.pages)) {
      mineruJson.pages.forEach((p: any, pageIdx) => {
        const pageNum = p.page || pageIdx + 1;
        const pageBlocks: NormalizedBlock[] = [];

        if (Array.isArray(p.blocks)) {
          // Sort blocks by visual layout coordinates (top Y first, then left X)
          const sortedBlocks = [...p.blocks].sort((a: any, b: any) => {
            const aBbox = Array.isArray(a.bbox) ? a.bbox : [0, 0, 0, 0];
            const bBbox = Array.isArray(b.bbox) ? b.bbox : [0, 0, 0, 0];
            const yDiff = aBbox[1] - bBbox[1];
            if (Math.abs(yDiff) > 3.0) {
              return yDiff;
            }
            return aBbox[0] - bBbox[0];
          });

          sortedBlocks.forEach((b: any, bIdx: number) => {
            const blockId = b.id || `p${pageNum}_b${bIdx + 1}`;
            const normalizedBlock: NormalizedBlock = {
              id: blockId,
              page: pageNum,
              order: globalOrder++,
              type: (b.type as any) || 'text',
              bbox: Array.isArray(b.bbox) ? b.bbox : [0, 0, 0, 0],
              content: b.content,
              image: b.image
            };

            pageBlocks.push(normalizedBlock);
            allBlocks.push(normalizedBlock);
            blockMap[blockId] = normalizedBlock;
          });
        }

        pages.push({
          page: pageNum,
          width: typeof p.width === 'number' ? p.width : 595.0,
          height: typeof p.height === 'number' ? p.height : 842.0,
          blocks: pageBlocks
        });
      });
    }

    return {
      title,
      pages,
      allBlocks,
      blockMap
    };
  }
}
