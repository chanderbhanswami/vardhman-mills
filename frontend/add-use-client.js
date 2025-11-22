import * as fs from 'fs';
import * as path from 'path';

const componentsToFix = [
  'src/components/ui/Dropdown.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/Modal.tsx',
  'src/components/ui/Progress.tsx',
];

componentsToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if 'use client' is already present
    if (content.trim().startsWith("'use client'") || content.trim().startsWith('"use client"')) {
      console.log(`⏭️  Already has 'use client': ${filePath}`);
      return;
    }
    
    // Add 'use client' at the beginning
    content = "'use client';\n\n" + content;
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Added 'use client' to ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n✨ All UI components processed');
