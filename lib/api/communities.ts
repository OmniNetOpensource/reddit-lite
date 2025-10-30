import { createClient } from '../supabase/client';
import { Community, CreateCommunityInput, Database } from '../types';

// Helper function to transform database row to Community type
function transformCommunity(row: Database['public']['Tables']['communities']['Row']): Community {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon || undefined,
    banner: row.banner || undefined,
    members: row.member_count,
    creatorId: row.creator_id || undefined,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Get all communities
 */
export async function getCommunities(): Promise<Community[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('member_count', { ascending: false });

  if (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }

  return data.map(transformCommunity);
}

/**
 * Get a single community by slug
 */
export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching community:', error);
    return null;
  }

  return transformCommunity(data);
}

/**
 * Get a single community by ID
 */
export async function getCommunityById(id: string): Promise<Community | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching community:', error);
    return null;
  }

  return transformCommunity(data);
}

/**
 * Create a new community
 */
export async function createCommunity(input: CreateCommunityInput): Promise<Community> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to create a community');
  }

  // Insert community
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      icon: input.icon || null,
      banner: input.banner || null,
      creator_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating community:', error);
    throw error;
  }

  // Automatically join the community as the creator
  await joinCommunity(data.id);

  return transformCommunity(data);
}

/**
 * Update a community
 */
export async function updateCommunity(id: string, input: Partial<CreateCommunityInput>): Promise<Community> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('communities')
    .update({
      name: input.name,
      description: input.description,
      icon: input.icon,
      banner: input.banner,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating community:', error);
    throw error;
  }

  return transformCommunity(data);
}

/**
 * Join a community
 */
export async function joinCommunity(communityId: string): Promise<void> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to join a community');
  }

  const { error } = await supabase
    .from('community_members')
    .insert({
      user_id: user.id,
      community_id: communityId,
    });

  if (error) {
    console.error('Error joining community:', error);
    throw error;
  }
}

/**
 * Leave a community
 */
export async function leaveCommunity(communityId: string): Promise<void> {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to leave a community');
  }

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('user_id', user.id)
    .eq('community_id', communityId);

  if (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
}

/**
 * Check if user is a member of a community
 */
export async function isUserMember(communityId: string): Promise<boolean> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from('community_members')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('community_id', communityId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Get communities that a user is a member of
 */
export async function getUserCommunities(userId?: string): Promise<Community[]> {
  const supabase = createClient();

  let targetUserId = userId;

  if (!targetUserId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return [];
    }
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from('community_members')
    .select('community:communities(*)')
    .eq('user_id', targetUserId);

  if (error) {
    console.error('Error fetching user communities:', error);
    return [];
  }

  return data
    .map((item: any) => item.community)
    .filter((community: any) => community !== null)
    .map(transformCommunity);
}

/**
 * Get popular communities (by member count)
 */
export async function getPopularCommunities(limit: number = 5): Promise<Community[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('member_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular communities:', error);
    return [];
  }

  return data.map(transformCommunity);
}

