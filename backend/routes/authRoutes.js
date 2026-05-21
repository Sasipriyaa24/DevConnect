import express from 'express';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

// ==================================================
// STEP 3 — AUTH ROUTES
// ==================================================

// POST /auth/signup - Register new account
router.post('/signup', signup);

// POST /auth/login - Login
router.post('/login', login);

export default router;
