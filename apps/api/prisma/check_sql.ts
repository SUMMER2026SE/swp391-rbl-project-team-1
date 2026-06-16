import fs from 'fs';
import readline from 'readline';

async function checkSql() {
  const fileStream = fs.createReadStream('c:/Users/duotech/OneDrive/Desktop/DONE_WEB_EDUPATH_AI/studychill_backup_latest.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const tables = [];
  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    const match = line.match(/CREATE TABLE `([^`]+)`/);
    if (match) {
      tables.push(match[1]);
    }
  }
  console.log(`Total lines read: ${lineCount}`);
  console.log('Tables found in SQL backup:', tables);
}

checkSql();
