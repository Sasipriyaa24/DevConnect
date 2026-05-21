// ==================================================
// STEP 1 — EXPRESS SERVER SETUP
// ==================================================

// We import the express library, which makes creating a backend server much easier than raw Node.js.
import express from 'express';

// We import cors. CORS stands for Cross-Origin Resource Sharing.
// Our frontend runs on localhost:5173 and backend on localhost:5000.
// Browsers block requests between different ports by default. CORS allows them to talk.
import cors from 'cors';

// Import our routes (which we will create in the next steps)
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';

// Create an instance of the express application
const app = express();

// Set the port we want our server to run on
const PORT = 5000;

// ==================================================
// MIDDLEWARE
// ==================================================
// Middleware are functions that run before our route handlers.

// Allow requests from our frontend
app.use(cors());

// Parse incoming request bodies that are in JSON format.
// This is necessary so we can read req.body when creating or updating data.
app.use(express.json());

// ==================================================
// ROUTES
// ==================================================
// We define simple, direct routes (no /api prefix as requested).
// When a request comes to /posts, Express will use the postRoutes file to handle it.

// Basic root route so we know the server is running when we visit http://localhost:5000/
app.get('/', (req, res) => {
  res.send('DevConnect Backend API is running!');
});

// Connect our separate route files to specific paths
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);
app.use('/auth', authRoutes);
app.use('/bookmarks', bookmarkRoutes);

// ==================================================
// START SERVER
// ==================================================
// Tell the app to listen for incoming requests on our specified port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
