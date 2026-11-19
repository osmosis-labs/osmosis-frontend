import { getRequestScope } from "@osmosis-labs/server";

import { runInRequestScope } from "../request-scope";

describe("runInRequestScope", () => {
  it("binds the scope that @osmosis-labs/server reads", () => {
    const waitUntil = jest.fn();

    const scope = runInRequestScope(waitUntil, () => getRequestScope());

    expect(scope).toBeDefined();
    const promise = Promise.resolve();
    scope!.waitUntil(promise);
    expect(waitUntil).toHaveBeenCalledWith(promise);
    expect(getRequestScope()).toBeUndefined();
  });
});
