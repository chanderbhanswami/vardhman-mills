import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix loyalty.service.ts
const loyaltyPath = path.join(__dirname, 'src', 'services', 'loyalty.service.ts');
let loyaltyContent = fs.readFileSync(loyaltyPath, 'utf8');

// Replace "if (!response.data) throw..." followed by "return response.data..." with just return and !
loyaltyContent = loyaltyContent.replace(
  /if \(!response\.data\) throw new Error\('No data received'\);\s+return response\.data\.data;/g,
  'return response.data!.data;'
);

loyaltyContent = loyaltyContent.replace(
  /if \(!response\.data\) throw new Error\('No data received'\);\s+return response\.data;/g,
  'return response.data!;'
);

fs.writeFileSync(loyaltyPath, loyaltyContent, 'utf8');
console.log('✅ Fixed loyalty.service.ts');

// Fix refund.service.ts
const refundPath = path.join(__dirname, 'src', 'services', 'refund.service.ts');
let refundContent = fs.readFileSync(refundPath, 'utf8');

refundContent = refundContent.replace(
  /if \(!response\.data\) throw new Error\('No data received'\);\s+return response\.data\.refund;/g,
  'return response.data!.refund;'
);

refundContent = refundContent.replace(
  /if \(!response\.data\) throw new Error\('No data received'\);\s+return response\.data\.refunds;/g,
  'return response.data!.refunds;'
);

refundContent = refundContent.replace(
  /if \(!response\.data\) throw new Error\('No data received'\);\s+return response\.data;/g,
  'return response.data!;'
);

fs.writeFileSync(refundPath, refundContent, 'utf8');
console.log('✅ Fixed refund.service.ts');

console.log('\n✨ All service files fixed with non-null assertions!');
