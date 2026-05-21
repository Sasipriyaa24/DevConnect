import express from 'express';
import { 
  getAllUsers, 
  getSingleUser, 
  searchUsers, 
  getTrendingDevelopers,
  updateUserProfile,
  toggleFollow,
  getMyFollowingIds,
  getMyFollowingProfiles
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================================================
// STEP 3 — USER ROUTES
// ==================================================
// Order matters in Express! Specific routes must come before dynamic parameter routes (/:id).
// Otherwise, a request to /users/trending would get caught by /users/:id with id = "trending".

// 1. GET /users - Return all users
router.get('/', getAllUsers);

// 2. GET /users/trending - Return top developers
router.get('/trending', getTrendingDevelopers);

// 3. GET /users/search/:query - Search by username/skill
router.get('/search/:query', searchUsers);

// 3.5. GET /users/me/following - Fetch followed dev IDs (Protected)
router.get('/me/following', protect, getMyFollowingIds);

// 3.6. GET /users/me/following/profiles - Fetch followed dev profiles (Protected)
router.get('/me/following/profiles', protect, getMyFollowingProfiles);

// 4. GET /users/:id - Return a specific user
router.get('/:id', getSingleUser);

// 5. PUT /users/:id - Update user details (Protected)
router.put('/:id', protect, updateUserProfile);

// 6. POST /users/:id/follow - Follow/Unfollow a user (Protected)
router.post('/:id/follow', protect, toggleFollow);

export default router;
