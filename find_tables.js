const fs = require('fs');
const readline = require('readline');

async function main() {
  const fileStream = fs.createReadStream('studychill_backup_latest.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let inTable = false;
  let count = 0;

  console.log('Extracting documents table info...');
  for await (const line of rl) {
    if (line.includes('CREATE TABLE `documents`')) {
      inTable = true;
    }
    
    if (inTable) {
      console.log(line);
      if (line.trim().startsWith(') ENGINE=')) {
        inTable = false;
      }
    }

    if (line.startsWith("INSERT INTO `documents`")) {
      count++;
      if (count <= 10) {
        console.log(`INSERT line ${count}:`, line.substring(0, 1000) + '...');
      }
    }
  }
  console.log(`Total INSERT statements for documents: ${count}`);
}

main();
