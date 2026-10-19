/** @jest-environment node */

import {
  makeIndexedKVStore,
  makeLocalStorageKVStore,
} from "../kv-store-factories";

it.each([makeIndexedKVStore, makeLocalStorageKVStore])(
  "uses isolated volatile memory stores without a browser",
  async (makeStore) => {
    expect(typeof window).toBe("undefined");
    const first = makeStore("server");
    const second = makeStore("server");
    expect(first.prefix()).toBe("server");
    await first.set("key", { value: 42 });
    expect(await first.get("key")).toEqual({ value: 42 });
    expect(await second.get("key")).toBeUndefined();
    // Preserve the memory provider's historical null semantics.
    await first.set("key", null);
    expect(await first.get("key")).toBeNull();
  }
);
