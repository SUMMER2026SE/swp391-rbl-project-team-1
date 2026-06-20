import fs from 'fs';
import readline from 'readline';

async function main() {
  const fileStream = fs.createReadStream('c:/Users/duotech/OneDrive/Desktop/DONE_WEB_EDUPATH_AI/studychill_backup_latest.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (/INSERT INTO `?courses`?/i.test(line)) {
      console.log(`Line ${lineNum} matches courses insert:`);
      console.log(line.substring(0, 200) + '...');
    }
  }
}

main();
