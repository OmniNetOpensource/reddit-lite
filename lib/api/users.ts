import { createClient } from '../supabase/client';
import { User, UpdateProfileInput, Database } from '../types';

// Helper function to transform database row to User type
function transformUser(row: Database['public']['Tables']['profiles']['Row']): User {
  return {
    id: row.id,
    username: row.username,
    avatar: row.avatar || undefined,
    karma: row.karma,
    bio: row.bio || undefined,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Get the current logged-in user's profile
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }

  return transformUser(data);
}

/**
 * Get a user profile by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return transformUser(data);
}

/**
 * Get a user profile by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return transformUser(data);
}

/**
 * Update the current user's profile
 */
export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  const supabase = createClient();

  // Get current user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser) {
    throw new Error('You must be logged in to update your profile');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: input.username,
      avatar: input.avatar,
      bio: input.bio,
    })
    .eq('id', authUser.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return transformUser(data);
}

/**
 * Check if a username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('Error checking username:', error);
    return false;
  }

  return data === null;
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<{
  postCount: number;
  commentCount: number;
  karma: number;
}> {
  const supabase = createClient();

  // Get post count
  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  // Get comment count
  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  // Get karma
  const { data: profile } = await supabase
    .from('profiles')
    .select('karma')
    .eq('id', userId)
    .single();

  return {
    postCount: postCount || 0,
    commentCount: commentCount || 0,
    karma: profile?.karma || 0,
  };
}

