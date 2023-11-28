import { incrementCounterMap } from "../tick-data-provider";

describe("incrementCounterMap", () => {
  test("increments the value of an existing key", () => {
    const map = new Map<string, number>([
      ["a", 1],
      ["b", 2],
    ]);

    incrementCounterMap(map, "a");
    expect(map.get("a")).toBe(2);
  });

  test("adds a new key with a value of 1 if the key does not exist", () => {
    const map = new Map<string, number>([
      ["a", 1],
      ["b", 2],
    ]);

    incrementCounterMap(map, "c");
    expect(map.get("c")).toBe(1);
  });

  test("returns the correct incremented value", () => {
    const map = new Map<string, number>([
      ["a", 1],
      ["b", 2],
    ]);

    const incrementedValue = incrementCounterMap(map, "a");
    expect(incrementedValue).toBe(2);
  });

  test("works with an empty map", () => {
    const map = new Map<string, number>();

    incrementCounterMap(map, "a");
    expect(map.get("a")).toBe(1);
  });

  test("works with a map containing multiple keys", () => {
    const map = new Map<string, number>([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);

    incrementCounterMap(map, "a");
    incrementCounterMap(map, "b");
    incrementCounterMap(map, "c");
    expect(map.get("a")).toBe(2);
    expect(map.get("b")).toBe(3);
    expect(map.get("c")).toBe(4);
  });
});
