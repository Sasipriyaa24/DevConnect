import express from 'express';
import { toggleBookmark, getBookmarkedPosts } from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================================================
// PHASE 7 — BOOKMARK ROUTES
// ==================================================

// GET /bookmarks - Fetch all bookmarked posts (Protected)
router.get('/', protect, getBookmarkedPosts);

// POST /bookmarks/:postId - Toggle bookmark status (Protected)
router.post('/:postId', protect, toggleBookmark);

export default router;
