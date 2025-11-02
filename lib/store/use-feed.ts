import { create } from 'zustand';
import { Post, Vote, SortOption } from '../types';
import { getPosts, votePost, getUserPostVotes } from '../api/posts';
import { getSavedPostStatuses } from '../api/saved-posts';

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
  setPostSavedState: (postId: string, saved: boolean) => void;
  removePost: (postId: string) => void;
  setPostVoteCount: (postId: string, votes: number) => void;
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

      let savedStatuses: Record<string, boolean> = {};
      if (posts.length > 0) {
        try {
          savedStatuses = await getSavedPostStatuses(posts.map((p) => p.id));
        } catch (error) {
          console.error('Error fetching saved post statuses:', error);
        }
      }

      const enhancedPosts = posts.map((post) => ({
        ...post,
        isSaved: savedStatuses[post.id] ?? false,
      }));

      set({ posts: enhancedPosts, isLoading: false });

      const postIds = posts.map((post) => post.id);
      await get().loadUserVotes(postIds);
    } catch (error: unknown) {
      console.error('Error fetching posts:', error);
      set({
        error: (error as Error).message || 'Failed to fetch posts',
        isLoading: false,
      });
    }
  },

  setPosts: (posts) => set({ posts }),

  addPost: (post) =>
    set((state) => {
      if (state.posts.some((existing) => existing.id === post.id)) {
        return { posts: state.posts };
      }

      return {
        posts: [{ ...post, isSaved: post.isSaved ?? false }, ...state.posts],
      };
    }),

  vote: async (postId, direction) => {
    const { votes, posts } = get();
    const currentVote = votes[postId];

    let newDirection: 'up' | 'down' | null = direction;
    let voteDelta = 0;

    if (currentVote?.direction === direction) {
      newDirection = null;
      voteDelta = direction === 'up' ? -1 : 1;
    } else if (currentVote?.direction) {
      voteDelta = direction === 'up' ? 2 : -2;
    } else {
      voteDelta = direction === 'up' ? 1 : -1;
    }

    set({
      votes: {
        ...votes,
        [postId]: { postId, direction: newDirection },
      },
      posts: posts.map((post) =>
        post.id === postId ? { ...post, votes: post.votes + voteDelta } : post
      ),
    });

    try {
      await votePost(postId, newDirection);
    } catch (error) {
      console.error('Error voting:', error);
      set({ votes, posts });
      throw error;
    }
  },

  setSortBy: (sort) => {
    set({ sortBy: sort });
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

  setPostVoteCount: (postId, votes) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, votes } : post
      ),
    })),

  setPostSavedState: (postId, saved) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, isSaved: saved } : post
      ),
    })),

  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    })),
}));
