import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { VoteButtons } from "@/components/post/vote-buttons";
import type { Vote } from "@/lib/types";

const voteMock = vi.fn(async () => {});
let currentVotes: Record<string, Vote> = {};

vi.mock("@/lib/store/use-feed", () => ({
  useFeed: () => ({ votes: currentVotes, vote: voteMock }),
}));

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

describe("VoteButtons", () => {
  beforeEach(() => {
    voteMock.mockClear();
    currentVotes = {};
  });

  it('calls vote("up") on upvote click', async () => {
    render(<VoteButtons postId="p1" votes={10} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /upvote/i }));
    await waitFor(() => expect(voteMock).toHaveBeenCalledWith("p1", "up"));
  });

  it("prevents double submit while voting is pending", async () => {
    const defer = () => {
      let resolve!: () => void;
      const promise = new Promise<void>((res) => {
        resolve = res;
      });
      return { promise, resolve } as const;
    };
    const { promise, resolve } = defer();
    voteMock.mockImplementationOnce(() => promise);

    render(<VoteButtons postId="p1" votes={10} />);
    const user = userEvent.setup();
    const upButton = screen.getByRole("button", { name: /upvote/i });
    await user.click(upButton);
    await waitFor(() => expect(voteMock).toHaveBeenCalledTimes(1));
    await user.click(upButton);
    expect(voteMock).toHaveBeenCalledTimes(1);
    resolve();
    await promise;
  });

  it("renders formatted count (e.g., 1.2k)", () => {
    render(<VoteButtons postId="p1" votes={1234} />);
    expect(screen.getByText("1.2k")).toBeInTheDocument();
  });
});
