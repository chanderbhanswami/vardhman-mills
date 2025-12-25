// Script to fix ESM imports - add .js extension to relative imports
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Match relative imports that don't have .js extension
    // Matches: from './something' or from '../something' (without .js)
    const importRegex = /(from\s+['"])(\.\.?\/[^'"]+?)(['"])/g;

    const newContent = content.replace(importRegex, (match, prefix, importPath, suffix) => {
        // Skip if already has .js or is importing from a package
        if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
            return match;
        }

        modified = true;
        return `${prefix}${importPath}.js${suffix}`;
    });

    if (modified) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Fixed: ${filePath}`);
        return 1;
    }
    return 0;
}

function walkDir(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist') {
                count += walkDir(filePath);
            }
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            count += fixImportsInFile(filePath);
        }
    }

    return count;
}

console.log('Fixing ESM imports in backend...');
const fixed = walkDir(srcDir);
console.log(`\nTotal files fixed: ${fixed}`);
