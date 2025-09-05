import { Router } from 'express';
import { protocolPlansController } from '../controllers/protocolPlansController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Protocol Plans CRUD operations
router.get('/', protocolPlansController.list);
router.post('/', protocolPlansController.create);
router.get('/:id', protocolPlansController.get);
router.put('/:id', protocolPlansController.update);
router.delete('/:id', protocolPlansController.delete);

// Protocol Plan actions
router.post('/:id/assign', protocolPlansController.assign);
router.get('/:id/preview', protocolPlansController.preview);

export default router;