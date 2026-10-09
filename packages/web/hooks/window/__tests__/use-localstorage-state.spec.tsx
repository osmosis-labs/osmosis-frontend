import { act, renderHook } from "@testing-library/react";

import { useLocalStorageState } from "~/hooks/window/use-localstorage-state";

describe("useLocalStorageState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("falls back to the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorageState("key", "init"));
    expect(result.current[0]).toBe("init");
  });

  it("reads an existing stored value", () => {
    window.localStorage.setItem("key", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorageState("key", "init"));
    expect(result.current[0]).toBe("stored");
  });

  it("falls back to the initial value when the stored value is not JSON", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    window.localStorage.setItem("key", "{not json");
    const { result } = renderHook(() => useLocalStorageState("key", "init"));
    expect(result.current[0]).toBe("init");
    consoleError.mockRestore();
  });

  it("persists writes and updates every instance on the same key", () => {
    const a = renderHook(() => useLocalStorageState("key", "init"));
    const b = renderHook(() => useLocalStorageState("key", "init"));
    act(() => a.result.current[1]("next"));
    expect(window.localStorage.getItem("key")).toBe(JSON.stringify("next"));
    expect(a.result.current[0]).toBe("next");
    expect(b.result.current[0]).toBe("next");
  });
});
