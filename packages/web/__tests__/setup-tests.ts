/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import "~/__mocks__/intersection-observer";

import { server } from "~/__tests__/msw";

// Point the app's `api` hooks at the tRPC context provided by test-utils.
jest.mock("~/utils/trpc", () => ({
  ...jest.requireActual("~/utils/trpc"),
  api: jest.requireActual("~/__tests__/trpc-react").trpcReact,
}));

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});
