/* eslint-disable import/no-extraneous-dependencies */
import * as Sentry from "@sentry/core";

import { captureError, captureErrorAndReturn, captureIfError } from "../error";

jest.mock("@sentry/core");

describe("captureErrorAndReturn", () => {
  it("should capture the error and return the provided value", () => {
    const mockError = new Error("Test error");
    const returnValue = "Return value";

    // Mock the captureError function to just return the error
    jest.spyOn(Sentry, "captureException").mockImplementation(() => "error");

    const result = captureErrorAndReturn(mockError, returnValue);

    expect(Sentry.captureException).toHaveBeenCalledWith(mockError);
    expect(result).toBe(returnValue);
  });
});

describe("captureError", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("captures Error instances", () => {
    const error = new Error("Test error");

    captureError(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  test("does not capture non-Error instances", () => {
    const notAnError = "Not an error";

    captureError(notAnError);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});

describe("captureIfError", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("captures Error thrown in closure", () => {
    const error = new Error("Test error");

    captureIfError(() => {
      throw error;
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  test("calls throwable function that doesn't throw", () => {
    captureIfError(() => {});
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
