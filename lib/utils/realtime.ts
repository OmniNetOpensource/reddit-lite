import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '../supabase/client';
import { Database } from '../types';

/**
 * Subscribe to new posts in real-time
 */
export function subscribeToNewPosts(
  onNewPost: (post: Database['public']['Tables']['posts']['Row']) => void,
  communityId?: string
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel('posts-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        ...(communityId && { filter: `community_id=eq.${communityId}` }),
      },
      async (payload) => {
        // Fetch the full post with author and community data
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!posts_author_id_fkey(*),
            community:communities!posts_community_id_fkey(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          onNewPost(data);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to post vote changes in real-time
 */
export function subscribeToPostVotes(
  postId: string,
  onVoteChange: (voteCount: number) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`post-${postId}-votes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${postId}`,
      },
      (payload) => {
        if (payload.new && 'vote_count' in payload.new) {
          onVoteChange(payload.new.vote_count as number);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to new comments on a post in real-time
 */
export function subscribeToNewComments(
  postId: string,
  onNewComment: (comment: Database['public']['Tables']['comments']['Row']) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`post-${postId}-comments`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      },
      async (payload) => {
        // Fetch the full comment with author data
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            author:profiles!comments_author_id_fkey(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          onNewComment(data);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to comment count changes for a post
 */
export function subscribeToCommentCount(
  postId: string,
  onCountChange: (count: number) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase
    .channel(`post-${postId}-comment-count`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${postId}`,
      },
      (payload) => {
        if (payload.new && 'comment_count' in payload.new) {
          onCountChange(payload.new.comment_count as number);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(channel: RealtimeChannel): void {
  const supabase = createClient();
  supabase.removeChannel(channel);
}

