import { act, renderHook } from "@testing-library/react";

import { useNavBarStore } from "../nav-bar-store";

describe("NavBarStore (Zustand)", () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useNavBarStore.setState({
      title: undefined,
      callToActionButtons: [],
      visibleBannerHeight: 0,
    });
  });

  describe("setVisibleBannerHeight", () => {
    it("should survive reset, since it is owned by the always-mounted NavBar", () => {
      const { result } = renderHook(() => useNavBarStore());

      act(() => {
        result.current.setVisibleBannerHeight(106);
        result.current.setTitle("Test Title");
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.title).toBeUndefined();
      expect(result.current.visibleBannerHeight).toBe(106);
    });
  });

  describe("reset", () => {
    it("should reset store to initial state", () => {
      const { result } = renderHook(() => useNavBarStore());

      // Set some state
      act(() => {
        result.current.setTitle("Test Title");
        result.current.setCallToActionButtons([{ label: "Button" }]);
      });

      expect(result.current.title).toBe("Test Title");
      expect(result.current.callToActionButtons).toHaveLength(1);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.title).toBeUndefined();
      expect(result.current.callToActionButtons).toEqual([]);
    });
  });
});
