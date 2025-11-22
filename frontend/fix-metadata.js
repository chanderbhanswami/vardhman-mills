import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToFix = [
  'src/app/(auth)/verify-otp/page.tsx',
  'src/app/(content)/contact/page.tsx',
  'src/app/(content)/faq/page.tsx',
  'src/app/(content)/legal-info/cookie-policy/page.tsx',
  'src/app/(content)/legal-info/page.tsx',
  'src/app/(content)/legal-info/privacy-policy/page.tsx',
  'src/app/(content)/legal-info/return-policy/page.tsx',
  'src/app/(content)/legal-info/shipping-policy/page.tsx',
  'src/app/(content)/legal-info/terms-conditions/page.tsx',
  'src/app/(content)/newsletter/subscribe/page.tsx',
  'src/app/(content)/newsletter/unsubscribe/page.tsx',
  'src/app/(main)/layout.tsx',
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if it's a client component
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      console.log(`⏭️  Skipping ${filePath} (not a client component)`);
      return;
    }
    
    // Remove Metadata import
    content = content.replace(/import\s+{\s*Metadata\s*}\s+from\s+['"]next['"];?\s*\n/g, '');
    content = content.replace(/import\s+type\s+{\s*Metadata\s*}\s+from\s+['"]next['"];?\s*\n/g, '');
    
    // Remove metadata export (single export const)
    content = content.replace(
      /export const metadata:\s*Metadata\s*=\s*{[\s\S]*?};(\s*\n)/g,
      '// Metadata removed (cannot be exported from client components)\n'
    );
    
    // Remove generateMetadata function
    content = content.replace(
      /export async function generateMetadata\([^)]*\):\s*Promise<Metadata>\s*{[\s\S]*?}\s*\n/g,
      '// generateMetadata removed (cannot be exported from client components)\n'
    );
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log('\n✨ All files processed!');
