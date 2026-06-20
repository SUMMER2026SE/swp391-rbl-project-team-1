const fs = require('fs');
const readline = require('readline');

// A simple SQL value list parser
function parseSqlValues(line) {
  // Line looks like: INSERT INTO `documents` VALUES (1,...),(2,...);
  const prefix = "INSERT INTO `documents` VALUES";
  if (!line.startsWith(prefix)) return [];
  
  let content = line.substring(prefix.length).trim();
  // Strip trailing semicolon if present
  if (content.endsWith(';')) {
    content = content.slice(0, -1);
  }
  
  // Now we have a list of values: (1,...),(2,...)
  // We need to parse them carefully because strings can contain commas, quotes, etc.
  const records = [];
  let i = 0;
  
  while (i < content.length) {
    if (content[i] === '(') {
      i++; // Skip '('
      const recordValues = [];
      
      while (i < content.length && content[i] !== ')') {
        // Skip whitespace
        while (i < content.length && (content[i] === ' ' || content[i] === '\t' || content[i] === '\n' || content[i] === '\r')) {
          i++;
        }
        
        if (content[i] === 'N' && content.substring(i, i + 4) === 'NULL') {
          recordValues.push(null);
          i += 4;
        } else if (content[i] === "'" || content[i] === '"') {
          // Read string literal
          const quote = content[i];
          i++; // Skip quote
          let str = "";
          while (i < content.length) {
            if (content[i] === '\\') {
              // Escaped char
              str += content[i + 1];
              i += 2;
            } else if (content[i] === quote) {
              i++; // Skip end quote
              break;
            } else {
              str += content[i];
              i++;
            }
          }
          recordValues.push(str);
        } else {
          // Numeric or boolean or something
          let numStr = "";
          while (i < content.length && content[i] !== ',' && content[i] !== ')') {
            numStr += content[i];
            i++;
          }
          numStr = numStr.trim();
          if (numStr === 'NULL') {
            recordValues.push(null);
          } else if (numStr.toLowerCase() === 'true') {
            recordValues.push(true);
          } else if (numStr.toLowerCase() === 'false') {
            recordValues.push(false);
          } else {
            const num = Number(numStr);
            recordValues.push(isNaN(num) ? numStr : num);
          }
        }
        
        // Skip comma or whitespace between items
        while (i < content.length && (content[i] === ' ' || content[i] === '\t' || content[i] === ',')) {
          i++;
        }
      }
      
      records.push(recordValues);
      i++; // Skip ')'
    }
    
    // Skip comma or whitespace between records
    while (i < content.length && (content[i] === ' ' || content[i] === '\t' || content[i] === ',' || content[i] === '\n' || content[i] === '\r')) {
      i++;
    }
  }
  
  return records;
}

async function main() {
  const fileStream = fs.createReadStream('studychill_backup_latest.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const columns = [
    'id', 'title', 'description', 'subject', 'level', 'is_free', 'drive_url',
    'image_url', 'price', 'is_active', 'is_deleted', 'created_at', 'updated_at',
    'commission_percent', 'markdown_description'
  ];

  console.log('Searching for inserts...');
  let totalRecords = 0;
  const allDocuments = [];

  for await (const line of rl) {
    if (line.startsWith("INSERT INTO `documents`")) {
      const records = parseSqlValues(line);
      for (const rec of records) {
        if (rec.length >= columns.length) {
          const doc = {};
          columns.forEach((col, idx) => {
            doc[col] = rec[idx];
          });
          allDocuments.push(doc);
        } else {
          console.warn(`Record has only ${rec.length} fields instead of ${columns.length}:`, rec.slice(0, 3));
        }
      }
      totalRecords += records.length;
    }
  }

  console.log(`Parsed ${allDocuments.length} documents. Saving...`);
  fs.writeFileSync('documents.json', JSON.stringify(allDocuments, null, 2), 'utf8');
  console.log('Saved to documents.json!');
}

main().catch(console.error);
