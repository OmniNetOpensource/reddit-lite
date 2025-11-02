import "@testing-library/jest-dom/vitest";
import { vi, beforeAll, afterAll, afterEach } from "vitest";

import { server } from "./msw.server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Provide common browser APIs used across components.
window.scrollTo = vi.fn();
vi.spyOn(window, "alert").mockImplementation(() => {});

// Enable React act() environment warnings handling for React 19.
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
