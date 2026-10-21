import { runWithFailureLimit } from "../utils";

const groupsOf = (count: number) =>
  Array.from({ length: count }, (_, i) => [`item-${i}`]);

describe("runWithFailureLimit", () => {
  it("processes every group when nothing fails", async () => {
    const seen: string[] = [];
    const result = await runWithFailureLimit(groupsOf(10), {
      concurrency: 3,
      maxFailures: 2,
      run: async (item) => {
        seen.push(item);
      },
    });

    expect(result).toEqual({ failures: 0, skipped: 0 });
    expect(seen).toHaveLength(10);
  });

  it("keeps a group's items in order on one worker", async () => {
    const order: string[] = [];
    await runWithFailureLimit([["a1", "a2", "a3"], ["b1"]], {
      concurrency: 4,
      maxFailures: 0,
      run: async (item) => {
        // the first item of the group is slow, the rest must still wait for it
        if (item === "a1") await new Promise((r) => setTimeout(r, 20));
        order.push(item);
      },
    });

    expect(order.indexOf("a1")).toBeLessThan(order.indexOf("a2"));
    expect(order.indexOf("a2")).toBeLessThan(order.indexOf("a3"));
  });

  it("keeps going while failures stay within the limit", async () => {
    let attempts = 0;
    const result = await runWithFailureLimit(groupsOf(20), {
      concurrency: 4,
      maxFailures: 5,
      run: async (item) => {
        attempts++;
        if (item.endsWith("3")) throw new Error(item);
      },
    });

    // item-3 and item-13 fail; everything else is still attempted
    expect(result).toEqual({ failures: 2, skipped: 0 });
    expect(attempts).toBe(20);
  });

  it("stops taking new groups once failures exceed the limit", async () => {
    let attempts = 0;
    const errors: string[] = [];
    const result = await runWithFailureLimit(groupsOf(200), {
      concurrency: 4,
      maxFailures: 10,
      run: async (item) => {
        attempts++;
        throw new Error(item);
      },
      onError: (e) => errors.push((e as Error).message),
    });

    expect(result.failures).toBeGreaterThan(10);
    // every worker may be mid-group when the limit is crossed, so at most
    // one extra attempt per worker past the limit, never the whole queue
    expect(attempts).toBeLessThanOrEqual(10 + 1 + 4);
    expect(result.skipped).toBe(200 - attempts);
    expect(errors).toHaveLength(attempts);
  });
});
