import { context, Span, trace } from "@opentelemetry/api";

import { captureError, captureErrorAndReturn, captureIfError } from "../error";

jest.mock("@opentelemetry/api");

describe("captureErrorAndReturn", () => {
  it("should capture the error and return the provided value", () => {
    const mockError = new Error("Test error");
    const returnValue = "Return value";
    const mockSpan = { recordException: jest.fn() };
    jest.spyOn(trace, "getSpan").mockReturnValue(mockSpan as unknown as Span);
    jest.spyOn(context, "active").mockReturnValue({} as any);

    const result = captureErrorAndReturn(mockError, returnValue);

    expect(mockSpan.recordException).toHaveBeenCalledWith(mockError);
    expect(result).toBe(returnValue);
  });
});

describe("captureError", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("captures Error instances", () => {
    const error = new Error("Test error");
    const mockSpan = { recordException: jest.fn() };
    jest.spyOn(trace, "getSpan").mockReturnValue(mockSpan as unknown as Span);
    jest.spyOn(context, "active").mockReturnValue({} as any);

    captureError(error);
    expect(mockSpan.recordException).toHaveBeenCalledWith(error);
  });

  test("does not capture non-Error instances", () => {
    const notAnError = "Not an error";
    const mockSpan = { recordException: jest.fn() };
    jest.spyOn(trace, "getSpan").mockReturnValue(mockSpan as unknown as Span);
    jest.spyOn(context, "active").mockReturnValue({} as any);

    captureError(notAnError);
    expect(mockSpan.recordException).not.toHaveBeenCalled();
  });
});

describe("captureIfError", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("captures Error thrown in closure", () => {
    const error = new Error("Test error");
    const mockSpan = { recordException: jest.fn() };
    jest.spyOn(trace, "getSpan").mockReturnValue(mockSpan as unknown as Span);
    jest.spyOn(context, "active").mockReturnValue({} as any);

    captureIfError(() => {
      throw error;
    });
    expect(mockSpan.recordException).toHaveBeenCalledWith(error);
  });

  test("calls throwable function that doesn't throw", () => {
    const mockSpan = { recordException: jest.fn() };
    jest.spyOn(trace, "getSpan").mockReturnValue(mockSpan as unknown as Span);
    jest.spyOn(context, "active").mockReturnValue({} as any);

    captureIfError(() => {});
    expect(mockSpan.recordException).not.toHaveBeenCalled();
  });
});
