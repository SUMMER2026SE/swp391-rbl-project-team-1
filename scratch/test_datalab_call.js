import { DatalabService } from '../src/services/datalab.service.js';
import path from 'path';
import fs from 'fs';

const testFile = path.resolve('../../uploads/file-1784019258705-379853910.pdf');
console.log('Testing file:', testFile, 'Exists?', fs.existsSync(testFile));

async function run() {
  try {
    const res = await DatalabService.parseDocument(testFile, 'test_exam.pdf');
    console.log('Datalab Result Title:', res.title);
    console.log('Full Markdown length:', res.fullMarkdown?.length);
    console.log('Preview:', res.fullMarkdown?.substring(0, 300));
  } catch (err) {
    console.error('Datalab Call Error:', err);
  }
}

run();
