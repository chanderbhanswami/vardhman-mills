import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix loyalty.service.ts
const loyaltyPath = path.join(__dirname, 'src', 'services', 'loyalty.service.ts');
let loyaltyContent = fs.readFileSync(loyaltyPath, 'utf8');

// Add null check before all response.data.data returns
loyaltyContent = loyaltyContent.replace(
  /(\s+)(return response\.data\.data;)/g,
  '$1if (!response.data) throw new Error(\'No data received\');\n$1$2'
);

// Fix the trackReferral function that returns response.data directly
loyaltyContent = loyaltyContent.replace(
  /(\s+)(return response\.data;)(\s+} catch \(error\) {\s+console\.error\('Error tracking referral')/,
  '$1if (!response.data) throw new Error(\'No data received\');\n$1$2$3'
);

fs.writeFileSync(loyaltyPath, loyaltyContent, 'utf8');
console.log('✅ Fixed loyalty.service.ts');

// Fix refund.service.ts
const refundPath = path.join(__dirname, 'src', 'services', 'refund.service.ts');
let refundContent = fs.readFileSync(refundPath, 'utf8');

// Add null check before all response.data returns
refundContent = refundContent.replace(
  /(\s+)(return response\.data\.refund;)/g,
  '$1if (!response.data) throw new Error(\'No data received\');\n$1$2'
);

refundContent = refundContent.replace(
  /(\s+)(return response\.data\.refunds;)/g,
  '$1if (!response.data) throw new Error(\'No data received\');\n$1$2'
);

refundContent = refundContent.replace(
  /(export async function getUserRefunds[\s\S]+?)(return response\.data;)/,
  '$1if (!response.data) throw new Error(\'No data received\');\n    $2'
);

fs.writeFileSync(refundPath, refundContent, 'utf8');
console.log('✅ Fixed refund.service.ts');

console.log('\n✨ All service files fixed!');
