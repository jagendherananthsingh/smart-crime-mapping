import { Router } from 'express';
import { MLController } from '../controllers/ml.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { trainModelSchema, predictCrimeSchema } from '../validators/ml.validator';

const router = Router();

router.get('/models', authenticate, MLController.getModels);
router.get('/results', authenticate, MLController.getResults);
router.get('/forecast', authenticate, MLController.getForecast);
router.post('/train', authenticate, validateBody(trainModelSchema), MLController.train);
router.post('/predict', authenticate, validateBody(predictCrimeSchema), MLController.predict);

export default router;
