// We import the express router which helps us group related routes together
import express from 'express';

// Import the logic functions from our controller
import { getPosts, getPostById, createPost, updatePost, deletePost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================================================
// STEP 7 — CONTROLLERS & ROUTES (SEPARATION OF CONCERNS)
// ==================================================
// This file ONLY defines WHICH URL goes to WHICH function.
// It keeps our code clean and modular. 
// Because we connected this to '/posts' in server.js, 
// the router.get('/') below actually means 'GET /posts/'

router.get('/', getPosts);
router.post('/', protect, createPost);

// The colon (:) indicates a dynamic parameter. 
// Express will capture whatever is put in the URL (e.g. /posts/p1) and make it available in req.params.id
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// Export the router so it can be imported in server.js
export default router;
