/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";
import "whatwg-fetch";

import { server } from "./msw-server";

/**
 * We use MSW to mock API requests at a network level in non-E2E Jest tests.
 * This is a global setup for MSW.
 * @see https://v1.mswjs.io/docs/
 */
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
