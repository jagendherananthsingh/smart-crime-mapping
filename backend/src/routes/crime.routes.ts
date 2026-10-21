import { Router } from 'express';
import { CrimeController } from '../controllers/crime.controller';
import { authenticate, requireRole, applyDataScope } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { createCrimeRecordSchema, crimeQuerySchema } from '../validators/crime.validator';

const router = Router();

router.get('/', authenticate, applyDataScope, validateQuery(crimeQuerySchema), CrimeController.getCrimes);
router.get('/filter-options', authenticate, applyDataScope, CrimeController.getFilterOptions);
router.get('/:id', authenticate, CrimeController.getCrimeById);
router.post('/', authenticate, requireRole(['ADMIN']), validateBody(createCrimeRecordSchema), CrimeController.createCrime);
router.put('/:id', authenticate, requireRole(['ADMIN']), CrimeController.updateCrime);
router.delete('/:id', authenticate, requireRole(['ADMIN']), CrimeController.deleteCrime);

export default router;
