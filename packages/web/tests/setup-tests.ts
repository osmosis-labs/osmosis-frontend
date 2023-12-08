/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";
import "whatwg-fetch";

import { server } from "./msw";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
