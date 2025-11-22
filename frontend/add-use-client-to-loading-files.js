import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all loading.tsx files
const loadingFiles = glob.sync('src/**/loading.tsx', { cwd: __dirname });

console.log(`Found ${loadingFiles.length} loading files`);

let updatedCount = 0;

loadingFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already has 'use client'
  if (content.includes("'use client'") || content.includes('"use client"')) {
    return;
  }
  
  // Add 'use client' after first comment block or at the top
  let newContent;
  
  if (content.startsWith('/**')) {
    // Find end of comment block
    const commentEnd = content.indexOf('*/');
    if (commentEnd !== -1) {
      const beforeComment = content.substring(0, commentEnd + 2);
      const afterComment = content.substring(commentEnd + 2);
      newContent = beforeComment + "\n\n'use client';" + afterComment;
    } else {
      newContent = "'use client';\n\n" + content;
    }
  } else if (content.startsWith('//')) {
    // Find end of first line comment
    const firstNewLine = content.indexOf('\n');
    if (firstNewLine !== -1) {
      const beforeComment = content.substring(0, firstNewLine + 1);
      const afterComment = content.substring(firstNewLine + 1);
      newContent = beforeComment + "\n'use client';" + afterComment;
    } else {
      newContent = "'use client';\n\n" + content;
    }
  } else {
    newContent = "'use client';\n\n" + content;
  }
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
  updatedCount++;
  console.log(`✓ Updated: ${file}`);
});

console.log(`\nUpdated ${updatedCount} files`);
