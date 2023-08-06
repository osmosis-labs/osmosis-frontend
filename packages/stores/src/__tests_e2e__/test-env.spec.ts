import { deepContained } from "./test-env";

describe("Test test env", () => {
  test("Test deep contain function", () => {
    const obj1 = {
      a: 2,
    };

    expect(() => {
      deepContained(obj1, {
        a: 2,
      });
    }).not.toThrow();

    expect(() => {
      deepContained(obj1, {
        a: 3,
      });
    }).toThrow();

    expect(() => {
      deepContained(obj1, {
        b: 2,
      });
    }).toThrow();
  });

  test("Test deep contain function nested", () => {
    const obj2 = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
          f: 4,
        },
      },
    };

    expect(() => {
      deepContained(
        {
          a: 1,
        },
        obj2
      );
    }).not.toThrow();

    expect(() => {
      deepContained(
        {
          b: {
            c: 2,
            d: {
              e: 3,
            },
          },
        },
        obj2
      );
    }).not.toThrow();

    expect(() => {
      deepContained(
        {
          b: {
            c: 2,
            d: {
              e: 4,
            },
          },
        },
        obj2
      );
    }).toThrow();

    expect(() => {
      deepContained(
        {
          b: {
            c: 2,
            d: {
              e: {
                f: 4,
              },
            },
          },
        },
        obj2
      );
    }).toThrow();
  });

  test("Test deep contain function with array", () => {
    const obj2 = {
      a: 1,
      b: [2, 3, 4, 5],
    };

    expect(() => {
      deepContained(
        {
          a: 1,
          b: [2],
        },
        obj2
      );
    }).not.toThrow();

    expect(() => {
      deepContained(
        {
          b: [2, 3],
        },
        obj2
      );
    }).not.toThrow();

    expect(() => {
      deepContained(
        {
          b: [2, 3, 6],
        },
        obj2
      );
    }).toThrow();

    expect(() => {
      deepContained(
        {
          a: 1,
          b: [6],
        },
        obj2
      );
    }).toThrow();

    expect(() => {
      deepContained(
        {
          a: 6,
          b: [2, 3],
        },
        obj2
      );
    }).toThrow();
  });

  test("Test deep contain function with array (2)", () => {
    const obj2 = {
      a: 1,
      b: [
        {
          c: {
            d: 2,
          },
        },
        {
          c: {
            e: 3,
          },
        },
        {
          f: {
            g: 4,
          },
        },
      ],
    };

    expect(() => {
      deepContained(
        {
          a: 1,
        },
        obj2
      );
    }).not.toThrow();

    expect(() => {
      deepContained(
        {
          b: [
            {
              c: {
                d: 2,
              },
            },
          ],
        },
        obj2
      );
    }).not.toThrow();

    expect(() => {
      deepContained(
        {
          b: [
            {
              c: {
                d: 2,
              },
            },
            {
              f: {
                g: 4,
              },
            },
          ],
        },
        obj2
      );
    }).not.toThrow();

    expect(() => {
      deepContained(
        {
          b: [
            {
              c: {
                d: 2,
              },
            },
            {
              f: {
                g: 5,
              },
            },
          ],
        },
        obj2
      );
    }).toThrow();

    expect(() => {
      deepContained(
        {
          b: [
            {
              c: {
                d: 2,
              },
            },
            {
              a: 1,
            },
          ],
        },
        obj2
      );
    }).toThrow();
  });
});
