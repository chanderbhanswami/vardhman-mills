import { Router } from 'express';
import multer from 'multer';

const router = Router();

// Simple memory storage for testing
const testUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log('TEST MULTER - Field name:', file.fieldname);
    console.log('TEST MULTER - Original name:', file.originalname);
    cb(null, true);
  }
}).any();

router.post('/test-upload', testUpload, (req, res) => {
  console.log('TEST ROUTE - Files:', req.files);
  console.log('TEST ROUTE - Body:', req.body);
  res.json({ 
    success: true, 
    files: req.files,
    body: req.body 
  });
});

export default router;