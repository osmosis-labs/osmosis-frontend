/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";

import { server } from "~/tests/msw";

/**
 * Allow re-defining `fetch` in tests
 */
Object.defineProperty(global, "fetch", {
  writable: true,
});

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
