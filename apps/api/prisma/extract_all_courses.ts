import fs from 'fs';
import readline from 'readline';

async function main() {
  const fileStream = fs.createReadStream('c:/Users/duotech/OneDrive/Desktop/DONE_WEB_EDUPATH_AI/studychill_backup_latest.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.startsWith('INSERT INTO `courses`')) {
      // Find all values patterns: (id, 'title', ...)
      // We can do a regex match or split on '),('
      const valuesStr = line.substring(line.indexOf('VALUES') + 7);
      // Clean trailing semicolon and newlines
      const cleanValues = valuesStr.trim().replace(/;$/, '');
      
      // Let's parse values safely by splitting on the end-parenthesis and comma pattern
      // To be accurate, let's parse using a state machine or regex
      const records: string[] = [];
      let currentRecord = '';
      let inString = false;
      let escape = false;
      let parenDepth = 0;

      for (let i = 0; i < cleanValues.length; i++) {
        const char = cleanValues[i];
        
        if (escape) {
          currentRecord += char;
          escape = false;
          continue;
        }

        if (char === '\\') {
          currentRecord += char;
          escape = true;
          continue;
        }

        if (char === '\'' && cleanValues[i - 1] !== '\\') {
          inString = !inString;
        }

        if (!inString) {
          if (char === '(') {
            parenDepth++;
            if (parenDepth === 1) {
              currentRecord = '';
              continue;
            }
          } else if (char === ')') {
            parenDepth--;
            if (parenDepth === 0) {
              records.push(currentRecord);
              continue;
            }
          }
        }

        if (parenDepth > 0) {
          currentRecord += char;
        }
      }

      console.log(`Parsed ${records.length} course records.`);
      records.forEach((rec, idx) => {
        const parts = rec.split(',');
        console.log(`Course ${idx + 1}: ID ${parts[0]} -> ${parts[1]}`);
      });
    }
  }
}

main();
