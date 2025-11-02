import { vi } from "vitest";

import { useFeed } from "@/lib/store/use-feed";
import type { Post } from "@/lib/types";

const now = new Date();
const basePost: Post = {
  id: "p1",
  title: "t",
  content: "",
  type: "text",
  url: undefined,
  imageUrl: undefined,
  isSaved: false,
  votes: 10,
  commentCount: 0,
  createdAt: now,
  author: {
    id: "u1",
    username: "u",
    avatar: undefined,
    karma: 0,
    bio: undefined,
    createdAt: now,
  },
  community: {
    id: "c1",
    name: "c",
    slug: "test",
    description: "",
    icon: undefined,
    banner: undefined,
    members: 0,
    creatorId: undefined,
    createdAt: now,
  },
};

const waitUntil = async (predicate: () => boolean, timeout = 1000) => {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    const tick = () => {
      if (predicate()) {
        resolve();
        return;
      }

      if (Date.now() - start >= timeout) {
        reject(new Error("Timed out waiting for condition"));
        return;
      }

      setTimeout(tick, 15);
    };

    tick();
  });
};

vi.mock("@/lib/api/posts", () => ({
  getPosts: vi.fn(async () => [basePost]),
  getUserPostVotes: vi.fn(async () => ({})),
  votePost: vi.fn(async () => {}),
}));

vi.mock("@/lib/api/saved-posts", () => ({
  getSavedPostStatuses: vi.fn(async () => ({})),
}));

describe("useFeed store", () => {
  beforeEach(() => {
    useFeed.setState({
      posts: [structuredClone(basePost)],
      votes: {},
      sortBy: "hot",
      isLoading: false,
      error: null,
    });
  });

  it("optimistically upvotes and toggles correctly", async () => {
    await useFeed.getState().vote("p1", "up");
    expect(useFeed.getState().posts[0].votes).toBe(11);
    await useFeed.getState().vote("p1", "up");
    expect(useFeed.getState().posts[0].votes).toBe(10);
    await useFeed.getState().vote("p1", "down");
    expect(useFeed.getState().posts[0].votes).toBe(9);
  });

  it("rolls back on API error", async () => {
    const api = await import("@/lib/api/posts");
    vi.spyOn(api, "votePost").mockRejectedValueOnce(new Error("fail"));

    const beforeVotes = useFeed.getState().posts[0].votes;
    await expect(useFeed.getState().vote("p1", "up")).rejects.toBeTruthy();
    expect(useFeed.getState().posts[0].votes).toBe(beforeVotes);
  });

  it("setSortBy triggers fetchPosts()", async () => {
    const api = await import("@/lib/api/posts");
    const spy = vi.spyOn(api, "getPosts");
    useFeed.getState().setSortBy("new");

    await waitUntil(() => spy.mock.calls.length > 0);
    expect(spy).toHaveBeenCalledWith("new", undefined);
  });
});
