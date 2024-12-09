import { safeTimeout } from "../date";

describe("safeTimeout", () => {
  jest.useFakeTimers(); // Use fake timers for controlled testing
  jest.spyOn(global, "setTimeout"); // Spy on the setTimeout function

  afterEach(() => {
    jest.clearAllTimers(); // Clear timers after each test
    jest.clearAllMocks();
  });

  test("calls setTimeout directly for time within safe range", () => {
    const callback = jest.fn();
    const timeInRange = 5000; // 5 seconds

    safeTimeout(callback, timeInRange);

    // Fast-forward time
    jest.advanceTimersByTime(timeInRange);

    // Ensure the callback is called once
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), timeInRange);
  });

  test("splits large timeout into smaller intervals", () => {
    const callback = jest.fn();
    const largeTimeout = 2591160000; // 29 days, 23 hours, 46 minutes
    const MAX_TIMEOUT = 2 ** 31 - 1; // JavaScript's maximum timeout (~24.8 days)

    safeTimeout(callback, largeTimeout);

    // Fast-forward the first interval
    jest.advanceTimersByTime(MAX_TIMEOUT);

    // Ensure another setTimeout was scheduled for the remainder
    expect(setTimeout).toHaveBeenCalledTimes(2);

    // Fast-forward the remaining time
    jest.advanceTimersByTime(largeTimeout - MAX_TIMEOUT);

    // Ensure the callback is called once after both intervals
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("handles exactly the maximum timeout limit", () => {
    const callback = jest.fn();
    const exactMaxTimeout = 2 ** 31 - 1;

    safeTimeout(callback, exactMaxTimeout);

    // Fast-forward time
    jest.advanceTimersByTime(exactMaxTimeout);

    // Ensure the callback is called once
    expect(callback).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      exactMaxTimeout
    );
  });

  test("does not call the callback prematurely", () => {
    const callback = jest.fn();
    const largeTimeout = 2591160000; // 29 days, 23 hours, 46 minutes

    safeTimeout(callback, largeTimeout);

    // Fast-forward time but do not complete all intervals
    jest.advanceTimersByTime(2 ** 31 - 2); // Just shy of the max timeout

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();
  });

  test("clears the timeout before it completes", () => {
    const callback = jest.fn(); // Mock callback function
    const largeTimeout = 2591160000; // ~30 days

    // Set up the safe timeout
    const { clear } = safeTimeout(callback, largeTimeout);

    // Fast-forward time by 5 seconds and then clear the timeout
    jest.advanceTimersByTime(5000); // Advance 5 seconds
    clear(); // Clear the timeout early

    // Advance time further to ensure the callback does not execute
    jest.advanceTimersByTime(largeTimeout);

    // Verify that the callback was never called
    expect(callback).not.toHaveBeenCalled();
  });

  test("clears the second timer in a split timeout chain", () => {
    const callback = jest.fn(); // Mock callback function
    const largeTimeout = 2591160000; // ~30 days
    const MAX_TIMEOUT = 2 ** 31 - 1; // JavaScript's maximum timeout (~24.8 days)

    // Set up the timeout
    const { clear } = safeTimeout(callback, largeTimeout);

    // Advance time to the end of the first timer but before the second timer finishes
    jest.advanceTimersByTime(MAX_TIMEOUT);

    // Clear the timeout during the second interval
    clear();

    // Advance time to simulate the remainder of the second timer
    jest.advanceTimersByTime(largeTimeout - MAX_TIMEOUT);

    // Verify that the callback was not called
    expect(callback).not.toHaveBeenCalled();
  });
});
