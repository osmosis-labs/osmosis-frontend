/** @jest-environment ../../jsdom-extended.js */

import "fake-indexeddb/auto";

import { IndexedDBKVStore, LocalKVStore } from "../kv-store";
import {
  makeIndexedKVStore,
  makeLocalStorageKVStore,
} from "../kv-store-factories";

const closingMessage =
  "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.";

afterEach(() => jest.restoreAllMocks());

describe.each([
  ["IndexedDB", makeIndexedKVStore],
  ["localStorage", makeLocalStorageKVStore],
] as const)("%s persistence", (_name, makeStore) => {
  it("persists across instances, isolates prefixes, and deletes with null", async () => {
    const prefix = `kv-spec-${_name}`;
    const first = makeStore(prefix);
    const second = makeStore(prefix);
    expect(first.prefix()).toBe(prefix);
    expect(await first.get("missing")).toBeUndefined();
    await first.set("key", { amount: "123", nested: [false, 0] });
    expect(await second.get("key")).toEqual({
      amount: "123",
      nested: [false, 0],
    });
    expect(await makeStore(prefix + "-other").get("key")).toBeUndefined();
    await second.set("key", null);
    expect(await first.get("key")).toBeUndefined();
  });
});

it("keeps the localStorage prefix/key format", async () => {
  await makeLocalStorageKVStore("legacy-prefix").set("key", "value");
  expect(localStorage.getItem("legacy-prefix/key")).toBe('"value"');
});

describe.each([
  [IndexedDBKVStore, makeIndexedKVStore],
  [LocalKVStore, makeLocalStorageKVStore],
] as const)("caught storage errors", (Store, makeStore) => {
  it("ignores only the existing database-closing error for reads and writes", async () => {
    const store = makeStore("closing");
    jest
      .spyOn(Store.prototype, "get")
      .mockRejectedValue(new Error(closingMessage));
    jest
      .spyOn(Store.prototype, "set")
      .mockRejectedValue(new Error(closingMessage));
    await expect(store.get("key")).resolves.toBeUndefined();
    await expect(store.set("key", "value")).resolves.toBeUndefined();
  });

  it("propagates other storage failures", async () => {
    const store = makeStore("failed");
    const error = new Error("storage unavailable");
    jest.spyOn(Store.prototype, "get").mockRejectedValue(error);
    jest.spyOn(Store.prototype, "set").mockRejectedValue(error);
    await expect(store.get("key")).rejects.toBe(error);
    await expect(store.set("key", "value")).rejects.toBe(error);
  });
});
