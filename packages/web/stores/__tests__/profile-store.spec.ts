/* eslint-disable import/no-extraneous-dependencies */
import { act, renderHook, waitFor } from "@testing-library/react";

import { mockStoreState } from "~/__tests__/zustand-utils";

import { useProfileStore } from "../profile-store";

const LEGACY_MIGRATION_COMPLETE_KEY = "profile-store/legacy-migration-complete";
const LEGACY_KEYS = [
  "profile_store/profile_store_current_avatar",
  "profile_store_current_avatar",
] as const;

describe("ProfileStore (Zustand)", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset the store to initial state
    useProfileStore.setState({ currentAvatar: "wosmongton" });
  });

  describe("Initial State", () => {
    it("should have wosmongton as the default avatar", () => {
      const { result } = renderHook(() => useProfileStore());
      expect(result.current.currentAvatar).toBe("wosmongton");
    });
  });

  describe("setCurrentAvatar", () => {
    it("should update avatar to ammelia", () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setCurrentAvatar("ammelia");
      });

      expect(result.current.currentAvatar).toBe("ammelia");
    });

    it("should update avatar back to wosmongton", () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setCurrentAvatar("ammelia");
      });
      expect(result.current.currentAvatar).toBe("ammelia");

      act(() => {
        result.current.setCurrentAvatar("wosmongton");
      });
      expect(result.current.currentAvatar).toBe("wosmongton");
    });
  });

  describe("Persistence", () => {
    it("should persist avatar selection to localStorage", async () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setCurrentAvatar("ammelia");
      });

      // Wait for persistence middleware to save to localStorage
      await waitFor(() => {
        const storedData = localStorage.getItem("profile-store");
        expect(storedData).toBeTruthy();
        const parsed = JSON.parse(storedData!);
        expect(parsed.state.currentAvatar).toBe("ammelia");
      });
    });

    it("should restore avatar from localStorage on initialization", async () => {
      // Pre-populate localStorage
      localStorage.setItem(
        "profile-store",
        JSON.stringify({
          state: { currentAvatar: "ammelia" },
          version: 0,
        })
      );

      // Clear the store and re-hydrate
      useProfileStore.persist.rehydrate();

      await waitFor(() => {
        const state = useProfileStore.getState();
        expect(state.currentAvatar).toBe("ammelia");
      });
    });
  });

  describe("Backward Compatibility", () => {
    it("should migrate avatar from legacy localStorage key (raw string)", async () => {
      localStorage.setItem(
        "profile_store/profile_store_current_avatar",
        "ammelia"
      );

      useProfileStore.persist.rehydrate();

      await waitFor(() => {
        expect(useProfileStore.getState().currentAvatar).toBe("ammelia");
      });

      // Legacy key should be removed after migration
      expect(
        localStorage.getItem("profile_store/profile_store_current_avatar")
      ).toBeNull();

      // Migration should also persist to the new zustand key
      const storedData = localStorage.getItem("profile-store");
      expect(storedData).toBeTruthy();
      const parsed = JSON.parse(storedData!);
      expect(parsed.state.currentAvatar).toBe("ammelia");
    });

    it("should migrate avatar from legacy localStorage key (JSON string)", async () => {
      localStorage.setItem(
        "profile_store/profile_store_current_avatar",
        JSON.stringify("ammelia")
      );

      useProfileStore.persist.rehydrate();

      await waitFor(() => {
        expect(useProfileStore.getState().currentAvatar).toBe("ammelia");
      });

      // Legacy key should be removed after migration
      expect(
        localStorage.getItem("profile_store/profile_store_current_avatar")
      ).toBeNull();

      // Migration should also persist to the new zustand key
      const storedData = localStorage.getItem("profile-store");
      expect(storedData).toBeTruthy();
      const parsed = JSON.parse(storedData!);
      expect(parsed.state.currentAvatar).toBe("ammelia");
    });
  });

  describe("Legacy Migration Early Exit", () => {
    it("should mark legacy migration complete when no legacy keys exist", async () => {
      useProfileStore.persist.rehydrate();

      await waitFor(() => {
        expect(localStorage.getItem(LEGACY_MIGRATION_COMPLETE_KEY)).toBe("1");
      });
    });

    it("should skip legacy key reads when legacy migration is marked complete", async () => {
      localStorage.setItem(LEGACY_MIGRATION_COMPLETE_KEY, "1");

      const getItemSpy = jest.spyOn(Storage.prototype, "getItem");
      try {
        useProfileStore.persist.rehydrate();

        // Ensure the early-exit check ran.
        await waitFor(() => {
          expect(getItemSpy).toHaveBeenCalledWith(
            LEGACY_MIGRATION_COMPLETE_KEY
          );
        });

        for (const legacyKey of LEGACY_KEYS) {
          expect(getItemSpy).not.toHaveBeenCalledWith(legacyKey);
        }
      } finally {
        getItemSpy.mockRestore();
      }
    });
  });

  describe("Type Safety", () => {
    it("should only accept valid avatar values", () => {
      const { result } = renderHook(() => useProfileStore());

      // TypeScript should enforce this at compile time,
      // but we can verify the store only has valid values
      act(() => {
        result.current.setCurrentAvatar("wosmongton");
      });
      expect(["wosmongton", "ammelia"]).toContain(result.current.currentAvatar);

      act(() => {
        result.current.setCurrentAvatar("ammelia");
      });
      expect(["wosmongton", "ammelia"]).toContain(result.current.currentAvatar);
    });
  });

  describe("mockStoreState helper", () => {
    it("should allow mocking store state for tests", () => {
      const restore = mockStoreState(useProfileStore, {
        currentAvatar: "ammelia",
      });

      expect(useProfileStore.getState().currentAvatar).toBe("ammelia");

      // Restore original state
      restore();
      expect(useProfileStore.getState().currentAvatar).toBe("wosmongton");
    });
  });
});
