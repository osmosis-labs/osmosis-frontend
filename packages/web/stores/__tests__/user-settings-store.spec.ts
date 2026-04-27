/* eslint-disable import/no-extraneous-dependencies */
import { act, renderHook, waitFor } from "@testing-library/react";

import { useUserSettingsStore } from "../user-settings-store";

const LEGACY_MIGRATION_COMPLETE_KEY =
  "user-settings-store/legacy-migration-complete";
const LEGACY_KEYS = [
  "hide-dust",
  "user_setting/hide-dust",
  "hide-balances",
  "user_setting/hide-balances",
  "language",
  "user_setting/language",
  "unverified-assets",
  "user_setting/unverified-assets",
] as const;

describe("UserSettingsStore (Zustand)", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset the store to initial state
    useUserSettingsStore.setState({
      hideDust: false,
      hideBalances: false,
      language: "en",
      showUnverifiedAssets: false,
    });
    // Remove persisted data so migration tests start from a clean slate
    useUserSettingsStore.persist.clearStorage();
  });

  describe("Initial State", () => {
    it("should have correct default values", () => {
      const { result } = renderHook(() => useUserSettingsStore());

      expect(result.current.hideDust).toBe(false);
      expect(result.current.hideBalances).toBe(false);
      expect(result.current.language).toBe("en");
      expect(result.current.showUnverifiedAssets).toBe(false);
    });
  });

  describe("hideDust", () => {
    it("should toggle hideDust setting", () => {
      const { result } = renderHook(() => useUserSettingsStore());

      act(() => {
        result.current.setHideDust(true);
      });
      expect(result.current.hideDust).toBe(true);

      act(() => {
        result.current.setHideDust(false);
      });
      expect(result.current.hideDust).toBe(false);
    });
  });

  describe("hideBalances", () => {
    it("should toggle hideBalances setting", () => {
      const { result } = renderHook(() => useUserSettingsStore());

      act(() => {
        result.current.setHideBalances(true);
      });
      expect(result.current.hideBalances).toBe(true);

      act(() => {
        result.current.setHideBalances(false);
      });
      expect(result.current.hideBalances).toBe(false);
    });
  });

  describe("language", () => {
    it("should update language setting", () => {
      const { result } = renderHook(() => useUserSettingsStore());

      act(() => {
        result.current.setLanguage("es");
      });
      expect(result.current.language).toBe("es");

      act(() => {
        result.current.setLanguage("ko");
      });
      expect(result.current.language).toBe("ko");
    });
  });

  describe("showUnverifiedAssets", () => {
    it("should toggle showUnverifiedAssets setting", () => {
      const { result } = renderHook(() => useUserSettingsStore());

      act(() => {
        result.current.setShowUnverifiedAssets(true);
      });
      expect(result.current.showUnverifiedAssets).toBe(true);

      act(() => {
        result.current.setShowUnverifiedAssets(false);
      });
      expect(result.current.showUnverifiedAssets).toBe(false);
    });
  });

  describe("Persistence", () => {
    it("should persist settings to localStorage", async () => {
      const { result } = renderHook(() => useUserSettingsStore());

      act(() => {
        result.current.setHideDust(true);
        result.current.setLanguage("fr");
      });

      // Wait for persistence
      await new Promise((resolve) => setTimeout(resolve, 100));

      const storedData = localStorage.getItem("user-settings-store");
      expect(storedData).toBeTruthy();
      const parsed = JSON.parse(storedData!);
      expect(parsed.state.hideDust).toBe(true);
      expect(parsed.state.language).toBe("fr");
    });

    it("should restore settings from localStorage on initialization", async () => {
      // Pre-populate localStorage
      localStorage.setItem(
        "user-settings-store",
        JSON.stringify({
          state: {
            hideDust: true,
            hideBalances: true,
            language: "de",
            showUnverifiedAssets: true,
          },
          version: 0,
        })
      );

      // Clear and rehydrate
      useUserSettingsStore.persist.rehydrate();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const state = useUserSettingsStore.getState();
      expect(state.hideDust).toBe(true);
      expect(state.hideBalances).toBe(true);
      expect(state.language).toBe("de");
      expect(state.showUnverifiedAssets).toBe(true);
    });
  });

  describe("Backward Compatibility", () => {
    it("should migrate from old localStorage keys", async () => {
      // Set up old storage format (individual keys)
      localStorage.setItem("hide-dust", JSON.stringify({ hideDust: true }));
      localStorage.setItem(
        "hide-balances",
        JSON.stringify({ hideBalances: true })
      );
      localStorage.setItem(
        "language",
        JSON.stringify({ language: "es", isControlOpen: false })
      );
      localStorage.setItem(
        "unverified-assets",
        JSON.stringify({ showUnverifiedAssets: true })
      );

      // Reset store to trigger migration
      useUserSettingsStore.setState({
        hideDust: false,
        hideBalances: false,
        language: "en",
        showUnverifiedAssets: false,
      });

      // Trigger rehydration which should migrate
      useUserSettingsStore.persist.rehydrate();

      await new Promise((resolve) => setTimeout(resolve, 100));

      // State should be migrated
      const state = useUserSettingsStore.getState();
      expect(state.hideDust).toBe(true);
      expect(state.hideBalances).toBe(true);
      expect(state.language).toBe("es");
      expect(state.showUnverifiedAssets).toBe(true);

      // Should mark legacy migration complete (enables early-exit on future loads)
      expect(localStorage.getItem(LEGACY_MIGRATION_COMPLETE_KEY)).toBe("1");
    });

    it("should migrate from namespaced legacy localStorage keys", async () => {
      // Set up old storage format (namespaced keys)
      localStorage.setItem(
        "user_setting/hide-dust",
        JSON.stringify({ hideDust: true })
      );
      localStorage.setItem(
        "user_setting/hide-balances",
        JSON.stringify({ hideBalances: true })
      );
      localStorage.setItem(
        "user_setting/language",
        JSON.stringify({ language: "es", isControlOpen: false })
      );
      localStorage.setItem(
        "user_setting/unverified-assets",
        JSON.stringify({ showUnverifiedAssets: true })
      );

      // Reset store to trigger migration
      useUserSettingsStore.setState({
        hideDust: false,
        hideBalances: false,
        language: "en",
        showUnverifiedAssets: false,
      });

      // Trigger rehydration which should migrate
      useUserSettingsStore.persist.rehydrate();

      await new Promise((resolve) => setTimeout(resolve, 100));

      // State should be migrated
      const state = useUserSettingsStore.getState();
      expect(state.hideDust).toBe(true);
      expect(state.hideBalances).toBe(true);
      expect(state.language).toBe("es");
      expect(state.showUnverifiedAssets).toBe(true);

      // Legacy keys should be removed after migration
      expect(localStorage.getItem("user_setting/hide-dust")).toBeNull();
      expect(localStorage.getItem("user_setting/hide-balances")).toBeNull();
      expect(localStorage.getItem("user_setting/language")).toBeNull();
      expect(localStorage.getItem("user_setting/unverified-assets")).toBeNull();

      // Migration should also persist to the new zustand key
      const storedData = localStorage.getItem("user-settings-store");
      expect(storedData).toBeTruthy();
      const parsed = JSON.parse(storedData!);
      expect(parsed.state.hideDust).toBe(true);
      expect(parsed.state.hideBalances).toBe(true);
      expect(parsed.state.language).toBe("es");
      expect(parsed.state.showUnverifiedAssets).toBe(true);

      // Should mark legacy migration complete (enables early-exit on future loads)
      expect(localStorage.getItem(LEGACY_MIGRATION_COMPLETE_KEY)).toBe("1");
    });

    it("should persist migrated settings on initial hydration", async () => {
      localStorage.setItem("hide-dust", JSON.stringify({ hideDust: true }));
      localStorage.setItem(
        "language",
        JSON.stringify({ language: "es", isControlOpen: false })
      );

      let isolatedStore: typeof useUserSettingsStore | undefined;
      jest.isolateModules(() => {
        ({
          useUserSettingsStore: isolatedStore,
        } = require("../user-settings-store"));
      });

      await waitFor(() => {
        const storedData = localStorage.getItem("user-settings-store");
        expect(storedData).toBeTruthy();
        const parsed = JSON.parse(storedData!);
        expect(parsed.state.hideDust).toBe(true);
        expect(parsed.state.language).toBe("es");
      });

      expect(isolatedStore?.getState().hideDust).toBe(true);
      expect(isolatedStore?.getState().language).toBe("es");
    });
  });

  describe("Legacy Migration Early Exit", () => {
    it("should mark legacy migration complete when no legacy keys exist", async () => {
      useUserSettingsStore.persist.rehydrate();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(localStorage.getItem(LEGACY_MIGRATION_COMPLETE_KEY)).toBe("1");
    });

    it("should skip legacy key reads when legacy migration is marked complete", async () => {
      localStorage.setItem(LEGACY_MIGRATION_COMPLETE_KEY, "1");

      const getItemSpy = jest.spyOn(Storage.prototype, "getItem");
      try {
        useUserSettingsStore.persist.rehydrate();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Ensure the early-exit check ran.
        expect(getItemSpy).toHaveBeenCalledWith(LEGACY_MIGRATION_COMPLETE_KEY);

        for (const legacyKey of LEGACY_KEYS) {
          expect(getItemSpy).not.toHaveBeenCalledWith(legacyKey);
        }
      } finally {
        getItemSpy.mockRestore();
      }
    });
  });
});
