import { supabase } from '../config/supabaseClient.js';

// ==================================================
// STEP 2 — AUTH MIDDLEWARE
// ==================================================
// This middleware runs on the server before hitting secured routes (like creating posts).
// It inspects the HTTP Headers to see if the user sent a valid session token.

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with "Bearer "
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access Denied: No session token provided.' 
      });
    }

    // Verify token with Supabase Auth service
    // This decodes the JWT and verifies that it is valid and has not expired!
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access Denied: Session token is invalid or expired.',
        error: error?.message 
      });
    }

    // Attach the verified user details to the request object so subsequent routes can access it!
    req.user = user;
    next(); // Pass control to the actual controller function!

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Authentication Error', 
      error: error.message 
    });
  }
};
