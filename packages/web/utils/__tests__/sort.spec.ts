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

    const result = sort(list, "name", "asc", (a, b) =>
      a.name.localeCompare(b.name)
    );
    expect(result).toEqual([
      { name: "Alice", age: 20 },
      { name: "Bob", age: 25 },
      { name: "John", age: 30 },
    ]);
  });
});
