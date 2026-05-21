import { supabase } from '../config/supabaseClient.js';
import { users } from './users.js';

// ==============================================================================
// DATABASE SEED SCRIPT
// This script will automatically insert our dummy users and posts into your 
// Supabase database, so you don't have to do it manually!
// ==============================================================================

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Insert Users
    console.log('Inserting users...');
    
    // We loop and insert each user one by one to avoid conflicts and see individual success
    for (const user of users) {
      // Map frontend-style keys to match the database column names in public.users
      const dbUser = {
        id: user.id,
        username: user.username,
        full_name: user.fullName,
        bio: user.bio,
        skills: user.skills,
        profile_image: user.profileImage,
        followers: user.followers,
        following: user.following,
        posts_count: user.postsCount,
        joined_date: user.joinedDate,
        github: user.github,
        linkedin: user.linkedin,
        location: user.location
      };

      const { error } = await supabase
        .from('users')
        .upsert([dbUser]); // upsert inserts if not present, updates if present

      if (error) {
        console.error(`❌ Failed to insert user ${user.username}:`, error.message);
      } else {
        console.log(`✅ Inserted user: ${user.username}`);
      }
    }

    // 2. Insert Posts
    console.log('Inserting posts...');
    const dummyPosts = [
      {
        id: 'p1',
        author: 'Sofia Chen',
        content: 'Finally open-sourced our internal migration helper. It wraps Postgres connections and adds dry-run mode by default.',
        likes_count: 24,
        comments_count: 8
      },
      {
        id: 'p2',
        author: 'Mina Okonkwo',
        content: 'Turns out the issue was unnecessary context updates, not the list virtualization. Documented the steps we used to isolate it.',
        likes_count: 41,
        comments_count: 12
      }
    ];

    const { error: postError } = await supabase
      .from('posts')
      .upsert(dummyPosts);

    if (postError) {
      console.error('❌ Failed to insert posts:', postError.message);
    } else {
      console.log('✅ Inserted initial posts successfully!');
    }

    console.log('🎉 Seeding complete! Your Supabase database is ready to go.');
  } catch (err) {
    console.error('❌ Unexpected seeding error:', err);
  }
}

seed();
