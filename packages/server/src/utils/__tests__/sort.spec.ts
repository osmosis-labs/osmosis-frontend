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

  it("should sort using a custom compare function", () => {
    const list = [
      { name: "John", age: 30 },
      { name: "Alice", age: 20 },
      { name: "Bob", age: 25 },
    ];

    const resultAsc = sort(list, "name", "asc", (a, b) =>
      a.name.localeCompare(b.name)
    );
    expect(resultAsc).toEqual([
      { name: "Alice", age: 20 },
      { name: "Bob", age: 25 },
      { name: "John", age: 30 },
    ]);

    const resultDesc = sort(list, "name", "desc", (a, b) =>
      b.name.localeCompare(a.name)
    );
    expect(resultDesc).toEqual([
      { name: "John", age: 30 },
      { name: "Bob", age: 25 },
      { name: "Alice", age: 20 },
    ]);
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

  it("should filter nil elements at the key path from sorting", () => {
    const list = [
      { name: "John", age: 30 },
      { name: "Alice", age: 20 },
      { name: "Bob", age: 25 },
      // these two should get filtered
      { name: "Bob", age: null },
      { name: "Bob", age: undefined },
      { name: "Bob", age: 0 },
    ];
    const result = sort(list, "age", "asc");
    expect(result).toEqual([
      // 0 is not nil, and should still be included with numeric values
      { name: "Bob", age: 0 },
      { name: "Alice", age: 20 },
      { name: "Bob", age: 25 },
      { name: "John", age: 30 },
    ]);
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
