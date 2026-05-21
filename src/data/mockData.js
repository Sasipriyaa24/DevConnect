export const CURRENT_USER = {
  id: 'u1',
  name: 'Sofia Chen',
  handle: 'sofiac',
  role: 'Full-stack Engineer',
  bio: 'Building developer tools and exploring distributed systems. React & Go enthusiast.',
  skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Go'],
  avatar: 'SC',
  followers: 148,
  following: 64,
  joined: 'March 2024'
}

export const TRENDING_DEVELOPERS = [
  { id: 't1', name: 'Noah Williams', handle: 'noahw', role: 'Backend · Postgres enthusiast', initials: 'NW' },
  { id: 't2', name: 'Priya Desai', handle: 'priyad', role: 'Frontend · Performance nerd', initials: 'PD' },
  { id: 't3', name: 'Jamal Hughes', handle: 'jamalh', role: 'Staff Engineer', initials: 'JH' },
]

export const DASHBOARD_STATS = [
  { label: 'Posts', value: '12', change: '+2 this week', positive: true },
  { label: 'Followers', value: '148', change: '+8 this week', positive: true },
  { label: 'Following', value: '64', change: 'No change', positive: false },
  { label: 'Likes received', value: '326', change: '+24 this week', positive: true },
]

export const ACTIVITY_LOG = [
  { id: 'a1', text: 'You published “Shipping a small CLI for database migrations”', time: '2 hours ago' },
  { id: 'a2', text: 'Mina Okonkwo commented on your post', time: '5 hours ago' },
  { id: 'a3', text: 'Jamal Hughes liked your post', time: '1 day ago' },
  { id: 'a4', text: 'You updated your profile skills', time: '3 days ago' },
]

export const INITIAL_POSTS = [
  {
    id: 1,
    author: 'Alex Rivera',
    handle: 'arivera',
    time: '2h ago',
    title: 'Shipping a small CLI for database migrations',
    body: 'Finally open-sourced our internal migration helper. It wraps Postgres connections and adds dry-run mode by default. Feedback welcome.',
    tags: ['postgres', 'nodejs', 'opensource'],
    likes: 24,
    comments: 8,
    isLiked: false,
  },
  {
    id: 2,
    author: 'Mina Okonkwo',
    handle: 'minaok',
    time: '5h ago',
    title: 'Notes from debugging a slow React render',
    body: 'Turns out the issue was unnecessary context updates, not the list virtualization. Documented the steps we used to isolate it.',
    tags: ['react', 'performance'],
    likes: 41,
    comments: 12,
    isLiked: true,
  },
  {
    id: 3,
    author: 'Jamal Hughes',
    handle: 'jamalh',
    time: '1d ago',
    title: 'System design reading list for mid-level engineers',
    body: 'Curated five papers and two books that helped our team align on trade-offs before a major rewrite. Happy to share the doc template.',
    tags: ['system-design', 'career'],
    likes: 67,
    comments: 19,
    isLiked: false,
  },
]

export const SAVED_POSTS = [
  { id: 's1', title: 'Notes from debugging a slow React render', author: 'Mina Okonkwo', time: 'Saved 2d ago' },
  { id: 's2', title: 'System design reading list for mid-level engineers', author: 'Jamal Hughes', time: 'Saved 5d ago' },
]
