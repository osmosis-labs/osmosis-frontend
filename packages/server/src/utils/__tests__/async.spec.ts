import { AsyncTimeoutError, timeout } from "../async";

describe("timeout", () => {
  it("should throw AsyncTimeoutError when the function takes too long", async () => {
    const longRunningFunction = () =>
      new Promise((resolve) => setTimeout(resolve, 2000));
    const timedFunction = timeout(longRunningFunction, 1000);

    await timedFunction().catch((error) => {
      expect(error).toBeInstanceOf(AsyncTimeoutError);
    });
  });

  it("should not throw AsyncTimeoutError when the function completes in time", async () => {
    const quickFunction = () =>
      new Promise((resolve) => setTimeout(() => resolve("success!"), 500));
    const timedFunction = timeout(quickFunction, 1000);

    await timedFunction().then((result) => {
      expect(result).toEqual("success!");
    });
  });

  it("should throw error from promise function", async () => {
    const quickFunction = () =>
      new Promise((_resolve, reject) =>
        setTimeout(() => reject("error!"), 500)
      );
    const timedFunction = timeout(quickFunction, 1000);

    await timedFunction().catch((result) => {
      expect(result).toEqual("error!");
    });
  });
});
