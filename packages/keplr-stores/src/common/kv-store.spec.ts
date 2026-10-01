import { MemoryKVStore } from "./kv-store";

describe("MemoryKVStore", () => {
  it("stores values under its prefix, including null", async () => {
    const store = new MemoryKVStore("test");

    expect(store.prefix()).toBe("test");
    expect(await store.get("missing")).toBeUndefined();

    await store.set("key", { a: 1 });
    expect(await store.get("key")).toEqual({ a: 1 });

    await store.set("key", null);
    expect(await store.get("key")).toBeNull();
  });

  it("keeps separate instances isolated", async () => {
    const a = new MemoryKVStore("a");
    const b = new MemoryKVStore("b");

    await a.set("key", 1);

    expect(await b.get("key")).toBeUndefined();
  });
});
