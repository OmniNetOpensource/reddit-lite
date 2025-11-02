import { createClient } from "../supabase/client";
import { Post, Database } from "../types";

type SavedPostRow = Database["public"]["Tables"]["saved_posts"]["Row"] & {
  post: Database["public"]["Tables"]["posts"]["Row"] & {
    author: Database["public"]["Tables"]["profiles"]["Row"];
    community: Database["public"]["Tables"]["communities"]["Row"];
  };
};

function transformPost(row: SavedPostRow): Post {
  const post = row.post;
  const author = post.author;
  const community = post.community;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    type: post.type as Post["type"],
    url: post.url || undefined,
    imageUrl: post.image_url || undefined,
    votes: post.vote_count,
    commentCount: post.comment_count,
    createdAt: new Date(post.created_at),
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
    isSaved: true,
    savedAt: new Date(row.saved_at),
  };
}

/**
 * Save a post for the current user.
 */
export async function savePost(postId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to save a post");
  }

  const { error } = await supabase.from("saved_posts").upsert(
    {
      user_id: user.id,
      post_id: postId,
    },
    { onConflict: "user_id,post_id" }
  );

  if (error) {
    console.error("Error saving post:", error);
    throw error;
  }
}

/**
 * Unsave a post for the current user.
 */
export async function unsavePost(postId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to unsave a post");
  }

  const { error } = await supabase
    .from("saved_posts")
    .delete()
    .eq("user_id", user.id)
    .eq("post_id", postId);

  if (error) {
    console.error("Error unsaving post:", error);
    throw error;
  }
}

/**
 * Get all saved posts for a user ordered by saved date.
 */
export async function getSavedPosts(userId: string): Promise<Post[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("saved_posts")
    .select(
      `
      saved_at,
      post:posts (
        *,
        author:profiles!posts_author_id_fkey(*),
        community:communities!posts_community_id_fkey(*)
      )
    `
    )
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved posts:", error);
    throw error;
  }

  if (!data) {
    return [];
  }

  return (data as unknown as SavedPostRow[])
    .filter((row) => row.post)
    .map((row) => transformPost(row));
}

/**
 * Determine if the current user has saved a specific post.
 */
export async function isPostSaved(postId: string): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from("saved_posts")
    .select("post_id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (error) {
    console.error("Error checking saved post:", error);
    return false;
  }

  return Boolean(data);
}

/**
 * Get saved status for a list of posts for the current user.
 */
export async function getSavedPostStatuses(
  postIds: string[]
): Promise<Record<string, boolean>> {
  const supabase = createClient();

  if (postIds.length === 0) {
    return {};
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {};
  }

  const { data, error } = await supabase
    .from("saved_posts")
    .select("post_id")
    .eq("user_id", user.id)
    .in("post_id", postIds);

  if (error || !data) {
    console.error("Error fetching saved statuses:", error);
    return {};
  }

  return data.reduce<Record<string, boolean>>((acc, row) => {
    acc[row.post_id] = true;
    return acc;
  }, {});
}
