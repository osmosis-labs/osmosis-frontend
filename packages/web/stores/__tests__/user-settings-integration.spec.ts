/* eslint-disable import/no-extraneous-dependencies */
import { act, renderHook } from "@testing-library/react";

import { useUserSettingsStore } from "../user-settings-store";

describe("UserSettingsStore Integration - showUnverifiedAssets", () => {
  beforeEach(() => {
    localStorage.clear();
    useUserSettingsStore.setState({
      hideDust: false,
      hideBalances: false,
      language: "en",
      showUnverifiedAssets: false,
    });
  });

  describe("setShowUnverifiedAssets", () => {
    it("should enable unverified assets via setter", () => {
      const { result } = renderHook(() => useUserSettingsStore());

      expect(result.current.showUnverifiedAssets).toBe(false);

      act(() => {
        result.current.setShowUnverifiedAssets(true);
      });

      expect(result.current.showUnverifiedAssets).toBe(true);
    });

    it("should work when called via getState() for non-hook contexts", () => {
      expect(useUserSettingsStore.getState().showUnverifiedAssets).toBe(false);

      act(() => {
        useUserSettingsStore.getState().setShowUnverifiedAssets(true);
      });

      expect(useUserSettingsStore.getState().showUnverifiedAssets).toBe(true);
    });

    it("should work when called via setState() for direct state updates", () => {
      expect(useUserSettingsStore.getState().showUnverifiedAssets).toBe(false);

      act(() => {
        useUserSettingsStore.setState({ showUnverifiedAssets: true });
      });

      expect(useUserSettingsStore.getState().showUnverifiedAssets).toBe(true);
    });
  });
});
