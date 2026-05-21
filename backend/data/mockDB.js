// ==================================================
// STEP 2 — DUMMY DATA
// ==================================================
// This file acts as our temporary database. We are using standard JavaScript arrays 
// to store data in memory while the server runs. If you restart the server, 
// any new data you added will be lost.

// Temporary users table
export const users = [
  {
    id: 'u1',
    username: 'sofiac',
    name: 'Sofia Chen',
    bio: 'Building developer tools and exploring distributed systems. React & Go enthusiast.',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    profileImage: 'SC',
    stats: {
      followers: 148,
      following: 64,
      joined: 'March 2024'
    }
  },
  {
    id: 'u2',
    username: 'noahw',
    name: 'Noah Williams',
    bio: 'Backend focused. Always optimizing queries.',
    skills: ['PostgreSQL', 'Redis', 'Python'],
    profileImage: 'NW',
    stats: {
      followers: 210,
      following: 45,
      joined: 'Jan 2023'
    }
  }
];

// Temporary posts table
export const posts = [
  {
    id: 'p1',
    author: 'Alex Rivera',
    content: 'Finally open-sourced our internal migration helper. It wraps Postgres connections and adds dry-run mode by default.',
    likesCount: 24,
    commentsCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'p2',
    author: 'Mina Okonkwo',
    content: 'Turns out the issue was unnecessary context updates, not the list virtualization. Documented the steps we used to isolate it.',
    likesCount: 41,
    commentsCount: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
  }
];

// Temporary comments table
export const comments = [
  {
    id: 'c1',
    postId: 'p1',
    author: 'Mina Okonkwo',
    content: 'This looks super useful, definitely going to try this out on our next migration.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
  }
];
