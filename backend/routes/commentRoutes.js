import express from 'express';
import { getCommentsByPost, addComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:postId', getCommentsByPost);
router.post('/', protect, addComment);

export default router;
