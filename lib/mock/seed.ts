import { User, Community, Post, Comment } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'techguru',
    avatar: '👨‍💻',
    karma: 15420,
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    username: 'designlover',
    avatar: '🎨',
    karma: 8930,
    createdAt: new Date('2023-03-20'),
  },
  {
    id: '3',
    username: 'codewizard',
    avatar: '🧙‍♂️',
    karma: 22100,
    createdAt: new Date('2022-11-05'),
  },
  {
    id: '4',
    username: 'reactfan',
    avatar: '⚛️',
    karma: 12500,
    createdAt: new Date('2023-02-10'),
  },
  {
    id: '5',
    username: 'nextjspro',
    avatar: '▲',
    karma: 18700,
    createdAt: new Date('2022-12-01'),
  },
];

// Mock Communities
export const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Next.js',
    slug: 'nextjs',
    description: 'The React Framework for Production - discuss Next.js features, best practices, and share your projects!',
    icon: '▲',
    members: 125000,
    createdAt: new Date('2022-01-01'),
  },
  {
    id: '2',
    name: 'React',
    slug: 'react',
    description: 'A JavaScript library for building user interfaces',
    icon: '⚛️',
    members: 450000,
    createdAt: new Date('2021-06-15'),
  },
  {
    id: '3',
    name: 'Web Development',
    slug: 'webdev',
    description: 'A community for web developers to share tips, tricks, and projects',
    icon: '🌐',
    members: 890000,
    createdAt: new Date('2021-03-10'),
  },
  {
    id: '4',
    name: 'TypeScript',
    slug: 'typescript',
    description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output',
    icon: '📘',
    members: 210000,
    createdAt: new Date('2021-08-20'),
  },
  {
    id: '5',
    name: 'Frontend',
    slug: 'frontend',
    description: 'Everything about frontend development - HTML, CSS, JavaScript, frameworks, and more',
    icon: '🎨',
    members: 320000,
    createdAt: new Date('2021-05-05'),
  },
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Next.js 15 is here! What are your favorite new features?',
    content: 'Just upgraded to Next.js 15 and I\'m loving the new App Router improvements. The partial prerendering is a game changer! What features are you most excited about?',
    author: mockUsers[4],
    community: mockCommunities[0],
    votes: 342,
    commentCount: 87,
    createdAt: new Date('2024-10-29T10:30:00'),
    type: 'text',
  },
  {
    id: '2',
    title: 'Built a Reddit clone with React and Next.js',
    content: 'After months of learning, I finally built my first full-stack project! It\'s a Reddit-like platform with authentication, posts, comments, and voting. Check it out and let me know what you think!',
    author: mockUsers[3],
    community: mockCommunities[1],
    votes: 1205,
    commentCount: 143,
    createdAt: new Date('2024-10-29T08:15:00'),
    type: 'text',
  },
  {
    id: '3',
    title: 'The state of web development in 2024',
    content: 'Looking back at how far we\'ve come. From jQuery to React, from callbacks to async/await, from REST to GraphQL. What do you think will be the next big thing?',
    author: mockUsers[0],
    community: mockCommunities[2],
    votes: 856,
    commentCount: 234,
    createdAt: new Date('2024-10-28T16:45:00'),
    type: 'text',
  },
  {
    id: '4',
    title: 'TypeScript 5.3 introduces new features for better type safety',
    content: 'The new import attributes and resolution improvements are fantastic. Anyone else excited about the narrowing improvements?',
    author: mockUsers[2],
    community: mockCommunities[3],
    votes: 567,
    commentCount: 92,
    createdAt: new Date('2024-10-28T14:20:00'),
    type: 'text',
  },
  {
    id: '5',
    title: 'CSS Grid vs Flexbox: When to use which?',
    content: 'I see a lot of beginners confused about when to use Grid vs Flexbox. Here\'s my take: Use Flexbox for one-dimensional layouts (rows OR columns), use Grid for two-dimensional layouts (rows AND columns). What\'s your approach?',
    author: mockUsers[1],
    community: mockCommunities[4],
    votes: 423,
    commentCount: 78,
    createdAt: new Date('2024-10-28T11:00:00'),
    type: 'text',
  },
  {
    id: '6',
    title: 'Server Components are changing everything',
    content: 'React Server Components are not just a React feature, they\'re changing how we think about building web apps. The ability to fetch data directly in components without client-side overhead is revolutionary.',
    author: mockUsers[4],
    community: mockCommunities[1],
    votes: 892,
    commentCount: 156,
    createdAt: new Date('2024-10-27T19:30:00'),
    type: 'text',
  },
  {
    id: '7',
    title: 'Show off your portfolio websites!',
    content: 'Let\'s see what everyone has built. Share your portfolio websites and get feedback from the community!',
    author: mockUsers[1],
    community: mockCommunities[2],
    votes: 234,
    commentCount: 189,
    createdAt: new Date('2024-10-27T15:10:00'),
    type: 'text',
  },
  {
    id: '8',
    title: 'How I optimized my Next.js app to load 3x faster',
    content: 'After profiling my app, I found several bottlenecks. Here are the top 5 optimizations that made the biggest difference: 1) Image optimization with next/image, 2) Code splitting, 3) Lazy loading components, 4) Reducing bundle size, 5) Using ISR instead of SSR where possible.',
    author: mockUsers[0],
    community: mockCommunities[0],
    votes: 1456,
    commentCount: 201,
    createdAt: new Date('2024-10-27T09:45:00'),
    type: 'text',
  },
  {
    id: '9',
    title: 'Zustand vs Redux: My experience after using both',
    content: 'I\'ve been using Redux for years, but recently switched to Zustand for a new project. The DX is amazing - so much less boilerplate! But I do miss some of Redux\'s ecosystem. What\'s your preference?',
    author: mockUsers[3],
    community: mockCommunities[1],
    votes: 678,
    commentCount: 145,
    createdAt: new Date('2024-10-26T20:15:00'),
    type: 'text',
  },
  {
    id: '10',
    title: 'Learning TypeScript: Tips for JavaScript developers',
    content: 'Made the switch from JS to TS last year. Best decision ever! Here are my top tips: Start with strict mode OFF, gradually enable it. Use type inference. Don\'t fight the compiler. Learn utility types. What helped you learn TS?',
    author: mockUsers[2],
    community: mockCommunities[3],
    votes: 534,
    commentCount: 87,
    createdAt: new Date('2024-10-26T13:30:00'),
    type: 'text',
  },
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: '1',
    content: 'Great post! I\'m particularly excited about the Turbopack improvements. Build times are so much faster now.',
    author: mockUsers[0],
    postId: '1',
    votes: 45,
    createdAt: new Date('2024-10-29T11:00:00'),
  },
  {
    id: '2',
    content: 'The partial prerendering feature is mind-blowing. It\'s like having the best of both static and dynamic rendering.',
    author: mockUsers[2],
    postId: '1',
    votes: 67,
    createdAt: new Date('2024-10-29T11:30:00'),
  },
  {
    id: '3',
    content: 'This is impressive! How long did it take you to build? Any challenges you faced?',
    author: mockUsers[0],
    postId: '2',
    votes: 23,
    createdAt: new Date('2024-10-29T09:00:00'),
  },
  {
    id: '4',
    content: 'About 3 months of evening/weekend work. The biggest challenge was implementing the voting system and making it feel responsive.',
    author: mockUsers[3],
    postId: '2',
    parentId: '3',
    votes: 34,
    createdAt: new Date('2024-10-29T09:30:00'),
  },
  {
    id: '5',
    content: 'I think AI-assisted development will be huge. We\'re already seeing it with Copilot and ChatGPT.',
    author: mockUsers[1],
    postId: '3',
    votes: 89,
    createdAt: new Date('2024-10-28T17:15:00'),
  },
  {
    id: '6',
    content: 'WebAssembly is going to change everything. Imagine running any language in the browser at near-native speed.',
    author: mockUsers[4],
    postId: '3',
    votes: 102,
    createdAt: new Date('2024-10-28T17:45:00'),
  },
];

// Helper function to get posts for a specific community
export function getPostsByCommunity(slug: string): Post[] {
  return mockPosts.filter(post => post.community.slug === slug);
}

// Helper function to get comments for a specific post
export function getCommentsByPostId(postId: string): Comment[] {
  return mockComments.filter(comment => comment.postId === postId);
}

// Helper function to get a single post by ID
export function getPostById(id: string): Post | undefined {
  return mockPosts.find(post => post.id === id);
}

// Helper function to get a community by slug
export function getCommunityBySlug(slug: string): Community | undefined {
  return mockCommunities.find(community => community.slug === slug);
}

