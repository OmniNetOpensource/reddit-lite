import { createClient } from '../supabase/client';
import { Comment, CreateCommentInput, UpdateCommentInput, Database } from '../types';

// Type definitions for query results with joined data
type CommentWithAuthor = Database['public']['Tables']['comments']['Row'] & {
  author: Database['public']['Tables']['profiles']['Row'];
};

// Helper function to transform database row to Comment type
function transformComment(
  commentRow: Database['public']['Tables']['comments']['Row'],
  author: Database['public']['Tables']['profiles']['Row']
): Comment {
  return {
    id: commentRow.id,
    content: commentRow.content,
    postId: commentRow.post_id,
    parentId: commentRow.parent_id || undefined,
    votes: commentRow.vote_count,
    createdAt: new Date(commentRow.created_at),
    author: {
      id: author.id,
      username: author.username,
      avatar: author.avatar || undefined,
      karma: author.karma,
      bio: author.bio || undefined,
      createdAt: new Date(author.created_at),
    },
  };
}

// Helper function to build nested comment tree
function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create map of all comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree structure
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        if (!parent.replies) {
          parent.replies = [];
        }
        parent.replies.push(commentWithReplies);
      } else {
        // Parent not found, treat as root comment
        rootComments.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  // Sort replies by vote count and date
  const sortComments = (comments: Comment[]) => {
    comments.sort((a, b) => {
      // Primary sort: votes
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      // Secondary sort: date
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    
    comments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        sortComments(comment.replies);
      }
    });
  };

  sortComments(rootComments);

  return rootComments;
}

/**
 * Get comments for a post (with nested structure)
 */
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Transform to Comment type
  const comments = data.map((row: CommentWithAuthor) => transformComment(row, row.author));

  // Build nested tree
  return buildCommentTree(comments);
}

/**
 * Create a new comment
 */
export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to comment');
  }

  // Insert comment
  const { data, error } = await supabase
    .from('comments')
    .insert({
      content: input.content,
      author_id: user.id,
      post_id: input.postId,
      parent_id: input.parentId || null,
    })
    .select(`
      *,
      author:profiles!comments_author_id_fkey(*)
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }

  return transformComment(data, data.author);
}

/**
 * Update an existing comment
 */
export async function updateComment(id: string, input: UpdateCommentInput): Promise<Comment> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('comments')
    .update({
      content: input.content,
    })
    .eq('id', id)
    .select(`
      *,
      author:profiles!comments_author_id_fkey(*)
    `)
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    throw error;
  }

  return transformComment(data, data.author);
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * Vote on a comment (upsert vote record)
 */
export async function voteComment(commentId: string, direction: 'up' | 'down' | null): Promise<void> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to vote');
  }

  // If direction is null, delete the vote
  if (direction === null) {
    const { error } = await supabase
      .from('comment_votes')
      .delete()
      .eq('user_id', user.id)
      .eq('comment_id', commentId);

    if (error) {
      console.error('Error removing vote:', error);
      throw error;
    }
    return;
  }

  // Otherwise, upsert the vote
  const { error } = await supabase
    .from('comment_votes')
    .upsert({
      user_id: user.id,
      comment_id: commentId,
      vote_direction: direction === 'up' ? 1 : -1,
    }, {
      onConflict: 'user_id,comment_id',
    });

  if (error) {
    console.error('Error voting on comment:', error);
    throw error;
  }
}

/**
 * Get user's vote on a comment
 */
export async function getUserCommentVote(commentId: string): Promise<'up' | 'down' | null> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('comment_votes')
    .select('vote_direction')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.vote_direction === 1 ? 'up' : 'down';
}

/**
 * Get user's votes for multiple comments
 */
export async function getUserCommentVotes(commentIds: string[]): Promise<Record<string, 'up' | 'down'>> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return {};
  }

  const { data, error } = await supabase
    .from('comment_votes')
    .select('comment_id, vote_direction')
    .eq('user_id', user.id)
    .in('comment_id', commentIds);

  if (error || !data) {
    return {};
  }

  const votes: Record<string, 'up' | 'down'> = {};
  data.forEach((vote) => {
    votes[vote.comment_id] = vote.vote_direction === 1 ? 'up' : 'down';
  });

  return votes;
}

