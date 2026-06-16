import fs from 'fs';
import readline from 'readline';

async function main() {
  const fileStream = fs.createReadStream('c:/Users/duotech/OneDrive/Desktop/DONE_WEB_EDUPATH_AI/studychill_backup_latest.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let inTable = false;
  let inInsert = false;
  
  for await (const line of rl) {
    if (line.includes('CREATE TABLE `courses`')) {
      inTable = true;
    }
    if (inTable) {
      console.log(line);
      if (line.includes(') ENGINE=')) {
        inTable = false;
      }
    }
    if (line.includes('INSERT INTO `courses`')) {
      console.log('Insert line length:', line.length);
      console.log('Snippet:', line.substring(0, 500) + '...');
    }
  }
}

main();
