import { create } from 'zustand';
import { Post, Vote, SortOption } from '../types';
import { getPosts, votePost, getUserPostVotes } from '../api/posts';

interface FeedState {
  posts: Post[];
  votes: Record<string, Vote>;
  sortBy: SortOption;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPosts: (communitySlug?: string) => Promise<void>;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  vote: (postId: string, direction: 'up' | 'down') => Promise<void>;
  setSortBy: (sort: SortOption) => void;
  loadUserVotes: (postIds: string[]) => Promise<void>;
}

export const useFeed = create<FeedState>((set, get) => ({
  posts: [],
  votes: {},
  sortBy: 'hot',
  isLoading: false,
  error: null,
  
  fetchPosts: async (communitySlug?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { sortBy } = get();
      const posts = await getPosts(sortBy, communitySlug);
      set({ posts, isLoading: false });
      
      // Load user votes for these posts
      const postIds = posts.map(p => p.id);
      await get().loadUserVotes(postIds);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      set({ 
        error: error.message || 'Failed to fetch posts',
        isLoading: false 
      });
    }
  },
  
  setPosts: (posts) => set({ posts }),
  
  addPost: (post) => set((state) => ({ 
    posts: [post, ...state.posts] 
  })),
  
  vote: async (postId, direction) => {
    const { votes, posts } = get();
    const currentVote = votes[postId];
    
    // Determine new vote direction
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
    
    // Optimistic update
    set({
      votes: {
        ...votes,
        [postId]: { postId, direction: newDirection },
      },
      posts: posts.map(p => 
        p.id === postId 
          ? { ...p, votes: p.votes + voteDelta }
          : p
      ),
    });
    
    // Make API call
    try {
      await votePost(postId, newDirection);
    } catch (error) {
      console.error('Error voting:', error);
      
      // Rollback on error
      set({
        votes,
        posts,
      });
      
      throw error;
    }
  },
  
  setSortBy: (sort) => {
    set({ sortBy: sort });
    // Refetch posts with new sort
    get().fetchPosts();
  },
  
  loadUserVotes: async (postIds: string[]) => {
    try {
      const userVotes = await getUserPostVotes(postIds);
      
      const votes: Record<string, Vote> = {};
      Object.entries(userVotes).forEach(([postId, direction]) => {
        votes[postId] = { postId, direction };
      });
      
      set({ votes });
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  },
}));

