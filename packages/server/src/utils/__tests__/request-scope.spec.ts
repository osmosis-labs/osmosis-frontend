import { AsyncLocalStorage } from "node:async_hooks";

import {
  getRequestScope,
  getRequestScoped,
  type RequestScope,
  setRequestScopeProvider,
} from "../request-scope";

const scopes = new AsyncLocalStorage<RequestScope>();

function inRequest<T>(fn: () => T): T {
  return scopes.run({ waitUntil: jest.fn() }, fn);
}

describe("request scope", () => {
  beforeAll(() => setRequestScopeProvider(() => scopes.getStore()));
  afterAll(() => setRequestScopeProvider(() => undefined));

  it("has no scope outside a request", () => {
    expect(getRequestScope()).toBeUndefined();
    expect(getRequestScoped({}, () => 1)).toBeUndefined();
  });

  it("creates a scoped value once per request", () => {
    const slot = {};
    let created = 0;
    const create = () => ({ n: ++created });

    const [a1, a2] = inRequest(() => [
      getRequestScoped(slot, create),
      getRequestScoped(slot, create),
    ]);
    const b = inRequest(() => getRequestScoped(slot, create));

    expect(a1).toBe(a2);
    expect(b).not.toBe(a1);
    expect(created).toBe(2);
  });
});
