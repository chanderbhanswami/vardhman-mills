import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const componentsToFix = [
  'src/components/notifications/NotificationCenter/NotificationCenter.tsx',
  'src/components/notifications/NotificationCenter/NotificationCount.tsx',
  'src/components/notifications/NotificationCenter/NotificationDropdown.tsx',
  'src/components/notifications/NotificationCenter/NotificationProvider.tsx',
  'src/components/reviews/AccountReviewsPage/AccountReplyItem.tsx',
  'src/components/reviews/ReviewItem/ReviewBody/index.tsx',
  'src/components/reviews/ReviewItem/ReviewBody/ReviewText.tsx',
  'src/components/reviews/ProductReviews/ReviewForm.tsx',
  'src/components/reviews/ProductReviews/ReviewsPagination.tsx',
  'src/components/reviews/ProductReviews/ReviewsList.tsx',
];

componentsToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Fix imports
    if (content.includes("from '@/hooks/useNotifications'")) {
      content = content.replace(
        /import\s+\{\s*useNotifications\s*\}\s+from\s+'@\/hooks\/useNotifications';/g,
        "import { useNotification } from '@/hooks/notification/useNotification';"
      );
      modified = true;
    }

    if (content.includes("from '@/hooks/useLocalStorage'")) {
      content = content.replace(
        /from\s+'@\/hooks\/useLocalStorage'/g,
        "from '@/hooks/localStorage/useLocalStorage'"
      );
      modified = true;
    }

    // Fix hook usage
    if (content.includes('useNotifications(')) {
      content = content.replace(/useNotifications\(/g, 'useNotification(');
      modified = true;
    }

    // Fix useLocalStorage destructuring - it returns an object, not a tuple
    // Pattern: const [value, setValue] = useLocalStorage(...) 
    // Should be: const { value, setValue } = useLocalStorage(...)
    content = content.replace(
      /const\s+\[(\w+),\s*(\w+)\]\s*=\s*useLocalStorage/g,
      'const { value: $1, setValue: $2 } = useLocalStorage'
    );

    if (modified || content !== fs.readFileSync(fullPath, 'utf8')) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n✨ All notification components processed');
