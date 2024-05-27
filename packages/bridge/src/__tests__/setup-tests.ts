/* eslint-disable import/no-extraneous-dependencies */
import { server } from "./msw";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
