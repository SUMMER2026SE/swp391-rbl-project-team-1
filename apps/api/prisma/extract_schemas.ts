import fs from 'fs';
import readline from 'readline';

async function extractTableSchemas() {
  const fileStream = fs.createReadStream('c:/Users/duotech/OneDrive/Desktop/DONE_WEB_EDUPATH_AI/studychill_backup_latest.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const targets = ['catalog_ai', 'fc_ai_quiz_cache', 'courses', 'documents'];
  let currentTable = null;
  let schemaBuffer = [];

  for await (const line of rl) {
    const createMatch = line.match(/CREATE TABLE `([^`]+)`/);
    if (createMatch) {
      const tbl = createMatch[1];
      if (targets.includes(tbl)) {
        currentTable = tbl;
        schemaBuffer = [line];
      } else {
        currentTable = null;
      }
    } else if (currentTable) {
      schemaBuffer.push(line);
      if (line.includes(') ENGINE=')) {
        console.log(`--- SCHEMA FOR ${currentTable} ---`);
        console.log(schemaBuffer.join('\n'));
        console.log('\n');
        currentTable = null;
      }
    }
  }
}

extractTableSchemas();
