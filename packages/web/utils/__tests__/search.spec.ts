import { Search, search } from "../search";

describe("search", () => {
  it("should return the correct results based on the query", () => {
    const data = [
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
      { name: "Doe", age: 35 },
    ];
    const keys = ["name", "age"];
    const searchParams: Search = { query: "John", limit: 2 };

    const result = search(data, keys, searchParams);

    expect(result).toEqual([{ name: "John", age: 30 }]);
  });

  it("should limit the results based on the limit parameter", () => {
    const data = [
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
      { name: "Doe", age: 35 },
    ];
    const keys = ["name", "age"];
    const searchParams: Search = { query: "a", limit: 1 };

    const result = search(data, keys, searchParams);

    expect(result).toEqual([{ name: "Jane", age: 25 }]);
  });

  it("should return an empty array if no match is found", () => {
    const data = [
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
      { name: "Doe", age: 35 },
    ];
    const keys = ["name", "age"];
    const searchParams: Search = { query: "XYZ", limit: 2 };

    const result = search(data, keys, searchParams);

    expect(result).toEqual([]);
  });
});
