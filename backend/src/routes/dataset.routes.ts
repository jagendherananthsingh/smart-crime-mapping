import { Router } from 'express';
import multer from 'multer';
import { DatasetController } from '../controllers/dataset.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are permitted'));
    }
  },
});

const router = Router();

router.get('/', authenticate, DatasetController.getDatasets);
router.get(['/sample/download', '/sample-download'], DatasetController.downloadSample);
router.get('/:id', authenticate, DatasetController.getDatasetById);
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  DatasetController.uploadDataset
);
router.post(
  '/:id/preprocess',
  authenticate,
  DatasetController.preprocessDataset
);
router.delete(
  '/:id',
  authenticate,
  requireRole(['ADMIN']),
  DatasetController.deleteDataset
);

export default router;
