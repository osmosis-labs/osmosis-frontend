/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import "~/__mocks__/intersection-observer";

import ResizeObserver from "resize-observer-polyfill";

import { server } from "~/__tests__/msw";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

global.ResizeObserver = ResizeObserver;
