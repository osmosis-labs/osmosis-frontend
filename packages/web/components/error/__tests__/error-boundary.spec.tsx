import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import React from "react";

import { captureError } from "~/utils/error";

import { ErrorBoundary } from "../error-boundary";

jest.mock("~/utils/error");

describe("ErrorBoundary", () => {
  const ChildComponent = () => {
    throw new Error("Test error");
  };

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render fallback UI when an error is thrown", () => {
    const FallbackComponent = () => <div>Something went wrong</div>;

    render(
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <ChildComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should call captureError when an error is thrown", () => {
    const FallbackComponent = () => <div>Something went wrong</div>;

    render(
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <ChildComponent />
      </ErrorBoundary>
    );

    expect(captureError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should call onError prop when an error is thrown", () => {
    const FallbackComponent = () => <div>Something went wrong</div>;
    const onErrorMock = jest.fn();

    render(
      <ErrorBoundary
        FallbackComponent={FallbackComponent}
        onError={onErrorMock}
      >
        <ChildComponent />
      </ErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });
});
