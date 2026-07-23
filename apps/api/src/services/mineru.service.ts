import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { extractTextFromFile } from '../utils/rag.js';

export interface MineruBlock {
  id: string;
  type: 'text' | 'image' | 'formula' | 'table';
  bbox: number[];
  content?: string | any[];
  image?: string;
}

export interface MineruPage {
  page: number;
  blocks: MineruBlock[];
}

export interface MineruDocumentJSON {
  title: string;
  pages: MineruPage[];
}

export class MineruService {
  private static get baseUrl(): string {
    const url = process.env.MINERU_API_URL || 'http://localhost:8001';
    return url.replace(/\/$/, '');
  }

  /**
   * Health check endpoint call to MinerU Service (GET /health)
   */
  static async checkHealth(): Promise<{ status: string }> {
    const endpoint = `${this.baseUrl}/health`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      throw new Error(`MinerU Service health check failed with status ${response.status}`);
    }
    return (await response.json()) as { status: string };
  }

  /**
   * Always renders PDF pages to PNG for Teacher Studio viewer & crop engine
   */
  static renderPdfPages(filePath: string): void {
    if (!fs.existsSync(filePath)) return;
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.pdf') return;

    const rootDir = path.resolve(process.cwd(), '..', '..');
    const outputDir = path.join(rootDir, 'tools', 'mineru', 'output', 'extracted_images');
    const renderScript = path.join(rootDir, 'tools', 'mineru', 'render_pdf.py');

    try {
      const cmd = `python "${renderScript}" "${filePath}" "${outputDir}"`;
      console.log(`[MineruService] Executing PDF page rendering: ${cmd}`);
      execSync(cmd, { cwd: rootDir, encoding: 'utf-8' });
    } catch (e: any) {
      console.warn(`[MineruService] PDF page rendering warning: ${e.message}`);
    }
  }

  /**
   * Uploads file to MinerU HTTP service (POST /parse) and receives normalized structured document JSON.
   */
  static async parseDocument(filePath: string, fileName: string, sessionId?: number): Promise<MineruDocumentJSON> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Render PDF page images first so they are available for Teacher Review Studio & Crop Generator
    this.renderPdfPages(filePath);

    console.log(`[MineruService] 🚀 Sending document '${fileName}' (Session: ${sessionId || 'N/A'}) to MinerU HTTP API (${this.baseUrl}/parse)...`);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(fileName || filePath).toLowerCase();
      const mimeType = ext === '.pdf' ? 'application/pdf' :
                       ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                       ext === '.doc' ? 'application/msword' : 'application/octet-stream';

      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('file', blob, fileName);
      if (sessionId) {
        formData.append('session_id', String(sessionId));
      }

      const endpoint = `${this.baseUrl}/parse`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(180000)
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`MinerU HTTP Service returned status ${response.status}: ${errText}`);
      }

      const data = (await response.json()) as MineruDocumentJSON;
      console.log(`[MineruService] ✅ Received parsed document JSON for '${fileName}': ${data.pages?.length || 0} pages`);
      return data;
    } catch (err: any) {
      console.warn(`[MineruService] ⚠️ MinerU HTTP API at ${this.baseUrl} is unavailable (${err.message}). Using local document extraction fallback...`);
      return await this.fallbackLocalParse(filePath, fileName);
    }
  }

  /**
   * Local fallback parser using extractTextFromFile when MinerU HTTP Service is offline
   */
  static async fallbackLocalParse(filePath: string, fileName: string): Promise<MineruDocumentJSON> {
    const ext = path.extname(fileName || filePath).toLowerCase().replace('.', '');
    let rawText = '';
    try {
      rawText = await extractTextFromFile(filePath, ext);
    } catch (e: any) {
      console.warn(`[MineruService] Local extractTextFromFile failed: ${e.message}`);
      rawText = `Tài liệu: ${fileName}`;
    }

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const blocks: MineruBlock[] = lines.map((line, idx) => ({
      id: `fallback_block_${idx}`,
      type: 'text',
      bbox: [10, idx * 20, 500, (idx + 1) * 20],
      content: line
    }));

    return {
      title: fileName,
      pages: [
        {
          page: 1,
          blocks: blocks.length > 0 ? blocks : [{ id: 'fallback_block_0', type: 'text', bbox: [0, 0, 500, 20], content: rawText || fileName }]
        }
      ]
    };
  }
}
