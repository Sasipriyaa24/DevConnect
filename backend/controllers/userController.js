import { supabase } from '../config/supabaseClient.js';

const createFallbackProfile = async (authUser) => {
  if (!authUser?.id) return null;

  const username = authUser.user_metadata?.name
    || authUser.email?.split('@')[0]
    || `user-${Date.now()}`;

  const fullName = authUser.user_metadata?.full_name
    || authUser.user_metadata?.name
    || authUser.email?.split('@')[0]
    || 'DevConnect User';

  const profileImage = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const { data: newUser, error } = await supabase
    .from('users')
    .insert([{
      id: authUser.id,
      username: username.toLowerCase(),
      full_name: fullName,
      bio: 'New developer on DevConnect',
      skills: [],
      profile_image: profileImage,
      followers: 0,
      following: 0,
      posts_count: 0,
      joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }])
    .select()
    .single();

  if (error) {
    console.error('Failed to create fallback profile:', error.message);
    return null;
  }

  return newUser;
};

const fetchPublicUser = async (field, value) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq(field, value)
    .single();

  if (error) return { data: null, error };
  return { data, error: null };
};

// ==================================================
// STEP 2 — USER CONTROLLER (SUPABASE INTEGRATION)
// ==================================================

// 1. Return all users
export const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// 2. Return trending developers (sorted by followers/posts)
export const getTrendingDevelopers = async (req, res) => {
  try {
    const { data: trending, error } = await supabase
      .from('users')
      .select('*')
      .order('followers', { ascending: false })
      .limit(3);

    if (error) throw error;
    
    res.status(200).json({
      success: true,
      data: trending
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// 3. Search users by username, full_name, bio, or skills
export const searchUsers = async (req, res) => {
  try {
    const query = req.params.query.toLowerCase().trim();

    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }
    
    // Fetch all users then filter in-memory.
    // WHY: Supabase doesn't easily support OR queries across text columns
    // AND a JSON/array skills field in a single query. In-memory filtering
    // is simple, reliable, and beginner-friendly for small-to-medium user counts.
    const { data: allUsers, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;

    const matchedUsers = (allUsers || []).filter(user => {
      const username = (user.username || '').toLowerCase();
      const fullName = (user.full_name || '').toLowerCase();
      const bio = (user.bio || '').toLowerCase();

      // Handle skills as either an array or comma-separated string
      const skills = Array.isArray(user.skills)
        ? user.skills
        : typeof user.skills === 'string'
        ? user.skills.split(',').map(s => s.trim())
        : [];
      const skillsMatch = skills.some(s => s.toLowerCase().includes(query));

      return username.includes(query) 
          || fullName.includes(query) 
          || bio.includes(query) 
          || skillsMatch;
    });

    res.status(200).json({
      success: true,
      data: matchedUsers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// 4. Return single user by id
export const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found or error",
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// 5. Update user profile details
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, bio, skills } = req.body;

    // Check if the user making the edit is the actual owner (security check)
    if (req.user.id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: You can only edit your own profile." 
      });
    }

    // Process skills into an array of trimmed strings
    const processedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        bio: bio,
        skills: processedSkills
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
};

// 6. Toggle Follow/Unfollow a developer
export const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id; // User to follow/unfollow
    const followerId = req.user.id; // Logged-in actor

    if (targetUserId === followerId) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot follow yourself!" 
      });
    }

    // Fetch the target user by ID first, then try username if needed.
    let targetUser = null;
    let targetId = targetUserId;
    const targetById = await fetchPublicUser('id', targetUserId);
    if (targetById.data) {
      targetUser = targetById.data;
    } else {
      const targetByUsername = await fetchPublicUser('username', targetUserId.toLowerCase());
      if (targetByUsername.data) {
        targetUser = targetByUsername.data;
        targetId = targetByUsername.data.id;
      }
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    // Ensure the logged-in actor has a public profile record too.
    let actorUser = null;
    const actorById = await fetchPublicUser('id', followerId);
    if (actorById.data) {
      actorUser = actorById.data;
    } else {
      actorUser = await createFallbackProfile(req.user);
    }

    if (!actorUser) {
      return res.status(404).json({ success: false, message: "Current user profile not found" });
    }

    // 1. Check if follow record already exists
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', targetId)
      .maybeSingle();

    let isFollowingNow = false;

    if (existingFollow) {
      // 2. UNFOLLOW!
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', targetId);

      if (deleteError) throw deleteError;

      // Decrement counts
      await supabase.from('users').update({ followers: Math.max(0, targetUser.followers - 1) }).eq('id', targetId);
      await supabase.from('users').update({ following: Math.max(0, actorUser.following - 1) }).eq('id', followerId);
      
      isFollowingNow = false;
    } else {
      // 3. FOLLOW!
      const { error: insertError } = await supabase
        .from('follows')
        .insert([{ follower_id: followerId, following_id: targetId }]);

      if (insertError) throw insertError;

      // Increment counts
      await supabase.from('users').update({ followers: targetUser.followers + 1 }).eq('id', targetId);
      await supabase.from('users').update({ following: actorUser.following + 1 }).eq('id', followerId);

      isFollowingNow = true;
    }

    res.status(200).json({
      success: true,
      message: isFollowingNow ? "Successfully followed developer" : "Successfully unfollowed developer",
      isFollowing: isFollowingNow
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling follow",
      error: error.message
    });
  }
};

// 7. Get user IDs the current logged-in user is following
export const getMyFollowingIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: follows, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (error) throw error;

    const followingIds = follows ? follows.map(f => f.following_id) : [];

    res.status(200).json({
      success: true,
      data: followingIds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching following ids",
      error: error.message
    });
  }
};

// 8. Get full user profiles the current logged-in user is following
export const getMyFollowingProfiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: follows, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (error) throw error;

    const followingIds = follows ? follows.map(f => f.following_id) : [];

    if (followingIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('id, username, full_name, profile_image')
      .in('id', followingIds);

    if (profileError) throw profileError;

    res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching following profiles",
      error: error.message
    });
  }
};
