import fs from 'fs';
import path from 'path';

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
   * Uploads file to MinerU HTTP service (POST /parse) and receives normalized structured document JSON.
   */
  static async parseDocument(filePath: string, fileName: string): Promise<MineruDocumentJSON> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    console.log(`[MineruService] 🚀 Sending document '${fileName}' to MinerU HTTP API (${this.baseUrl}/parse)...`);

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(fileName || filePath).toLowerCase();
    const mimeType = ext === '.pdf' ? 'application/pdf' :
                     ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                     ext === '.doc' ? 'application/msword' : 'application/octet-stream';

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('file', blob, fileName);

    const endpoint = `${this.baseUrl}/parse`;
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(180000)
      });
    } catch (err: any) {
      throw new Error(`Lỗi kết nối MinerU Service tại http://localhost:8001! Vui lòng nhấp đúp tệp 'tools/mineru/start.bat' trên máy để khởi động dịch vụ bóc tách. Chi tiết: ${err.message}`);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`MinerU HTTP Service returned status ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as MineruDocumentJSON;
    console.log(`[MineruService] ✅ Received parsed document JSON for '${fileName}': ${data.pages?.length || 0} pages`);
    return data;
  }
}
