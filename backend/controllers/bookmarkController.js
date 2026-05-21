import { supabase } from '../config/supabaseClient.js';

// ==================================================
// PHASE 7 — BOOKMARKS CONTROLLER
// ==================================================

// POST /bookmarks/:postId - Toggle bookmark status for a post
export const toggleBookmark = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id; // Logged-in actor from protect middleware

    // 1. Confirm post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // 2. Check if already bookmarked
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    let isBookmarked = false;

    if (existingBookmark) {
      // 3. Already bookmarked — REMOVE IT!
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (deleteError) throw deleteError;
      isBookmarked = false;
    } else {
      // 4. Not bookmarked — ADD IT!
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert([{ user_id: userId, post_id: postId }]);

      if (insertError) throw insertError;
      isBookmarked = true;
    }

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Post bookmarked successfully' : 'Post unbookmarked successfully',
      isBookmarked: isBookmarked
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling bookmark',
      error: error.message
    });
  }
};

// GET /bookmarks - Fetch all bookmarked posts for the logged-in user
export const getBookmarkedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the list of post_ids bookmarked by this user
    const { data: bookmarks, error: bookmarkError } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', userId);

    if (bookmarkError) throw bookmarkError;

    if (!bookmarks || bookmarks.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const postIds = bookmarks.map(b => b.post_id);

    // Fetch full post details for those bookmarked post_ids
    const { data: posts, error: postError } = await supabase
      .from('posts')
      .select('*')
      .in('id', postIds)
      .order('created_at', { ascending: false });

    if (postError) throw postError;

    res.status(200).json({
      success: true,
      data: posts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookmarks',
      error: error.message
    });
  }
};
