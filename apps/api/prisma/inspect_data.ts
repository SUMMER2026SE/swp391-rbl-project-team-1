import fs from 'fs';
import readline from 'readline';

async function inspectData() {
  const fileStream = fs.createReadStream('c:/Users/duotech/OneDrive/Desktop/DONE_WEB_EDUPATH_AI/studychill_backup_latest.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Searching for exam-related keywords in INSERT statements...");
  let lineCount = 0;
  const matches = [];

  for await (const line of rl) {
    lineCount++;
    if (line.startsWith('INSERT INTO')) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('thi thử') || lowerLine.includes('đề thi') || lowerLine.includes('luyện thi') || lowerLine.includes('mock exam')) {
        matches.push({
          lineNum: lineCount,
          snippet: line.substring(0, 300) + '...'
        });
      }
    }
  }

  console.log(`Finished scanning. Total lines: ${lineCount}`);
  console.log(`Found ${matches.length} matches:`);
  matches.forEach(m => {
    console.log(`[Line ${m.lineNum}]: ${m.snippet}`);
  });
}

inspectData();
