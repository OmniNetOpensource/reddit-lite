import { create } from 'zustand';
import { Comment } from '../types';
import { getCommentsByPostId, voteComment, getUserCommentVotes } from '../api/comments';

interface CommentVote {
  commentId: string;
  direction: 'up' | 'down' | null;
}

interface CommentsState {
  comments: Comment[];
  votes: Record<string, CommentVote>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchComments: (postId: string) => Promise<void>;
  addComment: (comment: Comment) => void;
  vote: (commentId: string, direction: 'up' | 'down') => Promise<void>;
  loadUserVotes: (commentIds: string[]) => Promise<void>;
  reset: () => void;
}

export const useComments = create<CommentsState>((set, get) => ({
  comments: [],
  votes: {},
  isLoading: false,
  error: null,
  
  fetchComments: async (postId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const comments = await getCommentsByPostId(postId);
      set({ comments, isLoading: false });
      
      // Load user votes for these comments (including nested ones)
      const getAllCommentIds = (comments: Comment[]): string[] => {
        const ids: string[] = [];
        comments.forEach(comment => {
          ids.push(comment.id);
          if (comment.replies && comment.replies.length > 0) {
            ids.push(...getAllCommentIds(comment.replies));
          }
        });
        return ids;
      };
      
      const commentIds = getAllCommentIds(comments);
      await get().loadUserVotes(commentIds);
    } catch (error: unknown) {
      console.error('Error fetching comments:', error);
      set({ 
        error: (error as Error).message || 'Failed to fetch comments',
        isLoading: false 
      });
    }
  },
  
  addComment: (comment) => set((state) => ({
    comments: [comment, ...state.comments]
  })),
  
  vote: async (commentId, direction) => {
    const { votes, comments } = get();
    const currentVote = votes[commentId];
    
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
    
    // Helper function to update votes in nested comments
    const updateCommentVotes = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, votes: comment.votes + voteDelta };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: updateCommentVotes(comment.replies) };
        }
        return comment;
      });
    };
    
    // Optimistic update
    set({
      votes: {
        ...votes,
        [commentId]: { commentId, direction: newDirection },
      },
      comments: updateCommentVotes(comments),
    });
    
    // Make API call
    try {
      await voteComment(commentId, newDirection);
    } catch (error) {
      console.error('Error voting:', error);
      
      // Rollback on error
      set({
        votes,
        comments,
      });
      
      throw error;
    }
  },
  
  loadUserVotes: async (commentIds: string[]) => {
    try {
      const userVotes = await getUserCommentVotes(commentIds);
      
      const votes: Record<string, CommentVote> = {};
      Object.entries(userVotes).forEach(([commentId, direction]) => {
        votes[commentId] = { commentId, direction };
      });
      
      set({ votes });
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  },
  
  reset: () => set({
    comments: [],
    votes: {},
    isLoading: false,
    error: null,
  }),
}));

