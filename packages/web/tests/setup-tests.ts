/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";

import { server } from "~/tests/msw";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
