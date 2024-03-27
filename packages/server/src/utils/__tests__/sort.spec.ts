import { sort } from "../sort";

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
});
