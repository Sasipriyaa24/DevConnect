import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("DevConnect Backend API is running!");
});

app.use("/posts", postRoutes);
app.use("/users", userRoutes);
app.use("/comments", commentRoutes);
app.use("/likes", likeRoutes);
app.use("/auth", authRoutes);
app.use("/bookmarks", bookmarkRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});