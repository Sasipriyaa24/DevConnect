import { supabase } from '../config/supabaseClient.js';

// ==================================================
// STEP 6 — LIKES API (SUPABASE INTEGRATION)
// ==================================================

export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id; // Passed by the protect middleware

    // 1. Fetch the current post to ensure it exists and get its likes count
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // 2. Check if this specific user has already liked this post
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle(); // maybeSingle returns null instead of throwing error if 0 rows are found!

    let newLikesCount = post.likes_count;
    let isLikedNow = false;

    if (existingLike) {
      // 3. USER ALREADY LIKED IT — UNLIKE IT!
      // Delete the like record
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Decrement the likes count
      newLikesCount = Math.max(0, post.likes_count - 1);
      isLikedNow = false;
    } else {
      // 4. USER HAS NOT LIKED IT YET — LIKE IT!
      // Insert a new like record
      const { error: insertError } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (insertError) throw insertError;

      // Increment the likes count
      newLikesCount = post.likes_count + 1;
      isLikedNow = true;
    }

    // 5. Update the post's likes_count in the posts table
    const { error: updateError } = await supabase
      .from('posts')
      .update({ likes_count: newLikesCount })
      .eq('id', postId);

    if (updateError) throw updateError;

    res.status(200).json({ 
      message: isLikedNow ? 'Post liked' : 'Post unliked', 
      likesCount: newLikesCount,
      isLiked: isLikedNow
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};
