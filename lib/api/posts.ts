import { createClient } from "../supabase/client";
import {
  Post,
  CreatePostInput,
  UpdatePostInput,
  SortOption,
  Database,
} from "../types";

// Type definitions for query results with joined data
type PostWithAuthorAndCommunity =
  Database["public"]["Tables"]["posts"]["Row"] & {
    author: Database["public"]["Tables"]["profiles"]["Row"];
    community: Database["public"]["Tables"]["communities"]["Row"];
  };

// Helper function to transform database row to Post type
function transformPost(
  postRow: Database["public"]["Tables"]["posts"]["Row"],
  author: Database["public"]["Tables"]["profiles"]["Row"],
  community: Database["public"]["Tables"]["communities"]["Row"]
): Post {
  return {
    id: postRow.id,
    title: postRow.title,
    content: postRow.content,
    type: postRow.type,
    url: postRow.url || undefined,
    imageUrl: postRow.image_url || undefined,
    votes: postRow.vote_count,
    commentCount: postRow.comment_count,
    createdAt: new Date(postRow.created_at),
    author: {
      id: author.id,
      username: author.username,
      avatar: author.avatar || undefined,
      karma: author.karma,
      bio: author.bio || undefined,
      createdAt: new Date(author.created_at),
    },
    community: {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      icon: community.icon || undefined,
      banner: community.banner || undefined,
      members: community.member_count,
      creatorId: community.creator_id || undefined,
      createdAt: new Date(community.created_at),
    },
  };
}

/**
 * Get posts with optional sorting and community filtering
 */
export async function getPosts(
  sortBy: SortOption = "hot",
  communitySlug?: string
): Promise<Post[]> {
  const supabase = createClient();

  let query = supabase.from("posts").select(`
      *,
      author:profiles!posts_author_id_fkey(*),
      community:communities!posts_community_id_fkey(*)
    `);

  // Filter by community if provided
  if (communitySlug) {
    const { data: community } = await supabase
      .from("communities")
      .select("id")
      .eq("slug", communitySlug)
      .single();

    if (community) {
      query = query.eq("community_id", community.id);
    }
  }

  // Apply sorting
  switch (sortBy) {
    case "new":
      query = query.order("created_at", { ascending: false });
      break;
    case "top":
      query = query.order("vote_count", { ascending: false });
      break;
    case "hot":
    case "rising":
      // Fetch all and sort in memory for complex algorithms
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }

  if (!data) {
    return [];
  }

  // Transform to Post type
  const posts = data.map((row: PostWithAuthorAndCommunity) =>
    transformPost(row, row.author, row.community)
  );

  // Apply client-side sorting for hot/rising
  if (sortBy === "hot") {
    posts.sort((a, b) => {
      const aHotScore =
        a.votes /
        Math.pow((Date.now() - a.createdAt.getTime()) / 3600000 + 2, 1.5);
      const bHotScore =
        b.votes /
        Math.pow((Date.now() - b.createdAt.getTime()) / 3600000 + 2, 1.5);
      return bHotScore - aHotScore;
    });
  } else if (sortBy === "rising") {
    posts.sort((a, b) => {
      const aScore = a.votes / (Date.now() - a.createdAt.getTime());
      const bScore = b.votes / (Date.now() - b.createdAt.getTime());
      return bScore - aScore;
    });
  }

  return posts;
}

/**
 * Get a single post by ID with full details
 */
export async function getPostById(id: string): Promise<Post | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles!posts_author_id_fkey(*),
      community:communities!posts_community_id_fkey(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching post:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return transformPost(data, data.author, data.community);
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("You must be logged in to create a post");
  }

  // Insert post
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: input.title,
      content: input.content || "",
      type: input.type,
      url: input.url || null,
      image_url: input.imageUrl || null,
      author_id: user.id,
      community_id: input.communityId,
    })
    .select(
      `
      *,
      author:profiles!posts_author_id_fkey(*),
      community:communities!posts_community_id_fkey(*)
    `
    )
    .single();

  if (error) {
    console.error("Error creating post:", error);
    throw error;
  }

  return transformPost(data, data.author, data.community);
}

/**
 * Update an existing post
 */
export async function updatePost(
  id: string,
  input: UpdatePostInput
): Promise<Post> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posts")
    .update({
      title: input.title,
      content: input.content,
      url: input.url,
      image_url: input.imageUrl,
    })
    .eq("id", id)
    .select(
      `
      *,
      author:profiles!posts_author_id_fkey(*),
      community:communities!posts_community_id_fkey(*)
    `
    )
    .single();

  if (error) {
    console.error("Error updating post:", error);
    throw error;
  }

  return transformPost(data, data.author, data.community);
}

/**
 * Delete a post
 */
export async function deletePost(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

/**
 * Vote on a post (upsert vote record)
 */
export async function votePost(
  postId: string,
  direction: "up" | "down" | null
): Promise<void> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("You must be logged in to vote");
  }

  // If direction is null, delete the vote
  if (direction === null) {
    const { error } = await supabase
      .from("post_votes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    if (error) {
      console.error("Error removing vote:", error);
      throw error;
    }
    return;
  }

  // Otherwise, upsert the vote
  const { error } = await supabase.from("post_votes").upsert(
    {
      user_id: user.id,
      post_id: postId,
      vote_direction: direction === "up" ? 1 : -1,
    },
    {
      onConflict: "user_id,post_id",
    }
  );

  if (error) {
    console.error("Error voting on post:", error);
    throw error;
  }
}

/**
 * Get user's vote on a post
 */
export async function getUserPostVote(
  postId: string
): Promise<"up" | "down" | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("post_votes")
    .select("vote_direction")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.vote_direction === 1 ? "up" : "down";
}

/**
 * Get user's votes for multiple posts
 */
export async function getUserPostVotes(
  postIds: string[]
): Promise<Record<string, "up" | "down">> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {};
  }

  const { data, error } = await supabase
    .from("post_votes")
    .select("post_id, vote_direction")
    .eq("user_id", user.id)
    .in("post_id", postIds);

  if (error || !data) {
    return {};
  }

  const votes: Record<string, "up" | "down"> = {};
  data.forEach((vote) => {
    votes[vote.post_id] = vote.vote_direction === 1 ? "up" : "down";
  });

  return votes;
}
