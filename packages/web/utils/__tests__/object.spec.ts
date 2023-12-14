import { getDeepValue } from "../object";

describe("getDeepValue", () => {
  it("should return the correct nested value", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    expect(getDeepValue(obj, "a.b.c")).toEqual("value");
  });

  it("should return undefined if the path does not exist", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    expect(getDeepValue(obj, "a.b.d")).toBeUndefined();
  });

  it("should handle a different delimiter", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    expect(getDeepValue(obj, "a/b/c", "/")).toEqual("value");
  });
});
