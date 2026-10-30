import { getValueAtPath, sort } from "../sort";

describe("sort function", () => {
  it("should sort an array of objects in ascending order", () => {
    const list = [
      { name: "John", age: 30 },
      { name: "Alice", age: 20 },
      { name: "Bob", age: 25 },
    ];
    const result = sort(list, "age", "asc");
    expect(result).toEqual([
      { name: "Alice", age: 20 },
      { name: "Bob", age: 25 },
      { name: "John", age: 30 },
    ]);
  });

  it("should sort an array of objects in descending order", () => {
    const list = [
      { name: "John", age: 30 },
      { name: "Alice", age: 20 },
      { name: "Bob", age: 25 },
    ];
    const result = sort(list, "age", "desc");
    expect(result).toEqual([
      { name: "John", age: 30 },
      { name: "Bob", age: 25 },
      { name: "Alice", age: 20 },
    ]);
  });

  it("should return the same array if the keyPath does not exist", () => {
    const list = [
      { name: "John", age: 30 },
      { name: "Alice", age: 20 },
      { name: "Bob", age: 25 },
    ];
    const result = sort(list, "height", "asc");
    expect(result).toEqual(list);
  });

  it("should sort using a deep key path", () => {
    const list = [
      { name: "John", age: { b: 20 } },
      { name: "Alice", age: { b: 34 } },
      { name: "Bob", age: { b: 1 } },
    ];

    // asc
    const resultAsc = sort(list, "age.b", "asc");
    expect(resultAsc).toEqual([
      { name: "Bob", age: { b: 1 } },
      { name: "John", age: { b: 20 } },
      { name: "Alice", age: { b: 34 } },
    ]);

    // desc
    const resultDesc = sort(list, "age.b", "desc");
    expect(resultDesc).toEqual([
      { name: "Alice", age: { b: 34 } },
      { name: "John", age: { b: 20 } },
      { name: "Bob", age: { b: 1 } },
    ]);
  });

  it("should NOT sort if the deep keypath is not in list", () => {
    const list = [
      { name: "John", age: { b: 20 } },
      { name: "Alice", age: { b: 34 } },
      { name: "Bob", age: { b: 1 } },
    ];

    const result = sort(list, "age.c", "asc");
    expect(result).toEqual(list);
  });

  it("should NOT sort if the keypath is not in list", () => {
    const list = [
      { name: "John", age: { b: 20 } },
      { name: "Alice", age: { b: 34 } },
      { name: "Bob", age: { b: 1 } },
    ];

    const result = sort(list, "address", "asc");
    expect(result).toEqual(list);
  });

  it("should NOT do anything if the list is empty", () => {
    const list: { a: number }[] = [];

    const result = sort(list, "address", "asc");
    expect(result).toEqual(list);
  });

  it("should keep nil elements at the key path, sorted last", () => {
    const list = [
      { name: "John", age: 30 },
      { name: "NoAgeNull", age: null },
      { name: "Alice", age: 20 },
      { name: "NoAgeUndefined", age: undefined },
      { name: "Bob", age: 25 },
      { name: "Zero", age: 0 },
    ];

    // nil rows stay in their original relative order, after every known value,
    // in both directions. 0 is not nil and sorts with the numeric values.
    expect(sort(list, "age", "asc").map((i) => i.name)).toEqual([
      "Zero",
      "Alice",
      "Bob",
      "John",
      "NoAgeNull",
      "NoAgeUndefined",
    ]);
    expect(sort(list, "age", "desc").map((i) => i.name)).toEqual([
      "John",
      "Bob",
      "Alice",
      "Zero",
      "NoAgeNull",
      "NoAgeUndefined",
    ]);
  });

  it("should sort when the first element's value is nil or 0", () => {
    const list = [
      { name: "Unknown", volume24h: undefined },
      { name: "Zero", volume24h: 0 },
      { name: "High", volume24h: 100 },
    ];

    expect(sort(list, "volume24h").map((i) => i.name)).toEqual([
      "High",
      "Zero",
      "Unknown",
    ]);
  });

  it("should not mutate the given list", () => {
    const list = [{ age: 1 }, { age: 2 }];
    sort(list, "age");
    expect(list).toEqual([{ age: 1 }, { age: 2 }]);
  });
});

describe("getValueAtPath", () => {
  it("retrieves a top-level property value", () => {
    const record = { name: "Alice", age: 30 };
    const value = getValueAtPath(record, "age");
    expect(value).toBe(30);
  });

  it("retrieves a nested property value", () => {
    const record = {
      person: { name: "Bob", details: { age: 25, city: "New York" } },
    };
    const value = getValueAtPath(record, "person.details.city");
    expect(value).toBe("New York");
  });

  it("returns undefined for a non-existent top-level property", () => {
    const record = { name: "Charlie" };
    const value = getValueAtPath(record, "age");
    expect(value).toBeUndefined();
  });

  it("returns undefined for a non-existent nested property", () => {
    const record = { person: { name: "Diana" } };
    const value = getValueAtPath(record, "person.details.age");
    expect(value).toBeUndefined();
  });

  it("handles an empty key path", () => {
    const record = { name: "Eve" };
    // Assuming an empty key path should return undefined. Adjust based on intended functionality.
    const value = getValueAtPath(record, "");
    expect(value).toBeUndefined();
  });

  it("handles arrays within the structure", () => {
    const record = { users: [{ name: "Frank" }, { name: "Grace" }] };
    const value = getValueAtPath(record, "users.1.name");
    expect(value).toBe("Grace");
  });
});
