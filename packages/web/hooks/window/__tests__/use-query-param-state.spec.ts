/* eslint-disable import/no-extraneous-dependencies */
import { act, renderHook } from "@testing-library/react-hooks";
import { useRouter as userRouterImport } from "next/router";
const useRouter = userRouterImport as any;

import { useQueryParamState } from "../use-query-param-state";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("useQueryParamState", () => {
  it("should return the correct initial state", () => {
    useRouter.mockImplementation(() => ({
      query: { testKey: "testValue" },
    }));

    const { result } = renderHook(() => useQueryParamState("testKey"));

    expect(result.current[0]).toBe("testValue");
  });

  it("should update the query param value", () => {
    const pushMock = jest.fn();
    useRouter.mockImplementation(() => ({
      query: { testKey: "testValue" },
      push: pushMock,
    }));

    const { result } = renderHook(() => useQueryParamState("testKey"));

    act(() => {
      result.current[1]("newValue");
    });

    expect(pushMock).toHaveBeenCalledWith(
      {
        query: {
          testKey: "newValue",
        },
      },
      undefined,
      { scroll: false }
    );
  });

  it("should set default value if query param is not present", () => {
    const pushMock = jest.fn();
    useRouter.mockImplementation(() => ({
      query: {},
      push: pushMock,
      isReady: true,
    }));

    renderHook(() => useQueryParamState("testKey", "defaultValue"));

    expect(pushMock).toHaveBeenCalledWith(
      {
        query: {
          testKey: "defaultValue",
        },
      },
      undefined,
      { scroll: false }
    );
  });
});
