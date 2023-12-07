/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";
import "whatwg-fetch";

import { server } from "./src/__tests_e2e__/msw-server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
