import { supabase } from '../config/supabaseClient.js';

// ==================================================
// STEP 5 — COMMENTS API (SUPABASE INTEGRATION)
// ==================================================

// GET /comments/:postId - Get all comments for a specific post
export const getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    const { data: postComments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    res.status(200).json(postComments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

// POST /comments - Add a new comment
export const addComment = async (req, res) => {
  try {
    const { postId, author, content } = req.body;

    if (!postId || !author || !content) {
      return res.status(400).json({ message: 'postId, author, and content are required' });
    }

    // Verify the post actually exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, comments_count')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      id: `c${Date.now()}`,
      post_id: postId,
      author: author,
      content: content
    };

    // Insert comment
    const { data: insertedComment, error: insertError } = await supabase
      .from('comments')
      .insert([newComment])
      .select()
      .single();

    if (insertError) throw insertError;

    // Increment the comment count on the post
    await supabase
      .from('posts')
      .update({ comments_count: post.comments_count + 1 })
      .eq('id', postId);

    res.status(201).json(insertedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};
