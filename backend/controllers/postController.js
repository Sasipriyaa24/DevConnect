import { supabase } from '../config/supabaseClient.js';

// ==================================================
// STEP 3 — POSTS API (SUPABASE INTEGRATION)
// ==================================================

// GET /posts - Return all posts
export const getPosts = async (req, res) => {
  try {
    // Fetch all posts from the 'posts' table, ordered by newest first
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

// GET /posts/:id - Return a single post
export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Fetch a single row matching the ID
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single(); // Tells Supabase we expect exactly 1 row

    if (error) {
      return res.status(404).json({ message: 'Post not found or error', error: error.message });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
};

// POST /posts - Create a new post
export const createPost = async (req, res) => {
  try {
    const { author, content, imageUrl } = req.body;

    if (!author || !content) {
      return res.status(400).json({ message: 'Author and content are required' });
    }

    const newPost = {
      id: `p${Date.now()}`, 
      author: author,
      content: content,
      likes_count: 0,
      comments_count: 0,
      image_url: imageUrl || null
      // created_at is handled automatically by Postgres default value
    };

    const { data: insertedPost, error } = await supabase
      .from('posts')
      .insert([newPost])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(insertedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// PUT /posts/:id - Update an existing post
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required to update' });
    }

    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update({ content: content })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
       return res.status(404).json({ message: 'Post not found or error', error: error.message });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
};

// DELETE /posts/:id - Delete a post
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};
