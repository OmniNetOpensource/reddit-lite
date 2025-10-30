// ============================================================================
// Database Types (matching Supabase schema)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar: string | null;
          karma: number;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar?: string | null;
          karma?: number;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar?: string | null;
          karma?: number;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      communities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          icon: string | null;
          banner: string | null;
          member_count: number;
          creator_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          icon?: string | null;
          banner?: string | null;
          member_count?: number;
          creator_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          icon?: string | null;
          banner?: string | null;
          member_count?: number;
          creator_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'text' | 'link' | 'image';
          url: string | null;
          image_url: string | null;
          author_id: string;
          community_id: string;
          vote_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string;
          type?: 'text' | 'link' | 'image';
          url?: string | null;
          image_url?: string | null;
          author_id: string;
          community_id: string;
          vote_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: 'text' | 'link' | 'image';
          url?: string | null;
          image_url?: string | null;
          author_id?: string;
          community_id?: string;
          vote_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          content: string;
          author_id: string;
          post_id: string;
          parent_id: string | null;
          vote_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author_id: string;
          post_id: string;
          parent_id?: string | null;
          vote_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author_id?: string;
          post_id?: string;
          parent_id?: string | null;
          vote_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_votes: {
        Row: {
          user_id: string;
          post_id: string;
          vote_direction: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_id: string;
          vote_direction: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          post_id?: string;
          vote_direction?: number;
          created_at?: string;
        };
      };
      comment_votes: {
        Row: {
          user_id: string;
          comment_id: string;
          vote_direction: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          comment_id: string;
          vote_direction: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          comment_id?: string;
          vote_direction?: number;
          created_at?: string;
        };
      };
      community_members: {
        Row: {
          user_id: string;
          community_id: string;
          joined_at: string;
        };
        Insert: {
          user_id: string;
          community_id: string;
          joined_at?: string;
        };
        Update: {
          user_id?: string;
          community_id?: string;
          joined_at?: string;
        };
      };
    };
  };
}

// ============================================================================
// Application Types (for use in components)
// ============================================================================

export interface User {
  id: string;
  username: string;
  avatar?: string;
  karma: number;
  bio?: string;
  createdAt: Date;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  banner?: string;
  members: number;
  creatorId?: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  community: Community;
  votes: number;
  commentCount: number;
  createdAt: Date;
  type: 'text' | 'link' | 'image';
  url?: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  votes: number;
  createdAt: Date;
  replies?: Comment[];
}

export interface Vote {
  postId: string;
  direction: 'up' | 'down' | null;
}

export type SortOption = 'hot' | 'new' | 'top' | 'rising';

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreatePostInput {
  title: string;
  content?: string;
  type: 'text' | 'link' | 'image';
  url?: string;
  imageUrl?: string;
  communityId: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  url?: string;
  imageUrl?: string;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface CreateCommunityInput {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  banner?: string;
}

export interface UpdateProfileInput {
  username?: string;
  avatar?: string;
  bio?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type VoteDirection = 'up' | 'down' | null;

export interface PostWithDetails extends Omit<Database['public']['Tables']['posts']['Row'], 'author_id' | 'community_id'> {
  author: Database['public']['Tables']['profiles']['Row'];
  community: Database['public']['Tables']['communities']['Row'];
}

export interface CommentWithDetails extends Omit<Database['public']['Tables']['comments']['Row'], 'author_id'> {
  author: Database['public']['Tables']['profiles']['Row'];
}

