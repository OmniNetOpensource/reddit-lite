import { create } from 'zustand';
import { Post, Vote, SortOption } from '../types';
import { mockPosts } from '../mock/seed';

interface FeedState {
  posts: Post[];
  votes: Record<string, Vote>;
  sortBy: SortOption;
  
  // Actions
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  vote: (postId: string, direction: 'up' | 'down') => void;
  setSortBy: (sort: SortOption) => void;
  getSortedPosts: () => Post[];
}

export const useFeed = create<FeedState>((set, get) => ({
  posts: mockPosts,
  votes: {},
  sortBy: 'hot',
  
  setPosts: (posts) => set({ posts }),
  
  addPost: (post) => set((state) => ({ 
    posts: [post, ...state.posts] 
  })),
  
  vote: (postId, direction) => set((state) => {
    const currentVote = state.votes[postId];
    const post = state.posts.find(p => p.id === postId);
    
    if (!post) return state;
    
    let newDirection: 'up' | 'down' | null = direction;
    let voteDelta = 0;
    
    // If clicking the same direction, remove vote
    if (currentVote?.direction === direction) {
      newDirection = null;
      voteDelta = direction === 'up' ? -1 : 1;
    } 
    // If switching from opposite direction
    else if (currentVote?.direction) {
      voteDelta = direction === 'up' ? 2 : -2;
    }
    // If no previous vote
    else {
      voteDelta = direction === 'up' ? 1 : -1;
    }
    
    return {
      votes: {
        ...state.votes,
        [postId]: { postId, direction: newDirection },
      },
      posts: state.posts.map(p => 
        p.id === postId 
          ? { ...p, votes: p.votes + voteDelta }
          : p
      ),
    };
  }),
  
  setSortBy: (sort) => set({ sortBy: sort }),
  
  getSortedPosts: () => {
    const { posts, sortBy } = get();
    const sortedPosts = [...posts];
    
    switch (sortBy) {
      case 'new':
        return sortedPosts.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
      
      case 'top':
        return sortedPosts.sort((a, b) => b.votes - a.votes);
      
      case 'rising':
        // Simple rising algorithm: recent posts with good vote ratio
        return sortedPosts.sort((a, b) => {
          const aScore = a.votes / (Date.now() - a.createdAt.getTime());
          const bScore = b.votes / (Date.now() - b.createdAt.getTime());
          return bScore - aScore;
        });
      
      case 'hot':
      default:
        // Hot algorithm: combination of votes and recency
        return sortedPosts.sort((a, b) => {
          const aHotScore = a.votes / Math.pow((Date.now() - a.createdAt.getTime()) / 3600000 + 2, 1.5);
          const bHotScore = b.votes / Math.pow((Date.now() - b.createdAt.getTime()) / 3600000 + 2, 1.5);
          return bHotScore - aHotScore;
        });
    }
  },
}));

