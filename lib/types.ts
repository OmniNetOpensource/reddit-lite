export interface User {
  id: string;
  username: string;
  avatar?: string;
  karma: number;
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

