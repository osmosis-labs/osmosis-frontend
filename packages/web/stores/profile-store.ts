import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Avatar type - matches the original MobX ProfileStore
 */
export type Avatar = "wosmongton" | "ammelia";

/**
 * Profile store state interface
 */
interface ProfileState {
  /** Current selected avatar */
  currentAvatar: Avatar;
  /** Update the current avatar */
  setCurrentAvatar: (avatar: Avatar) => void;
}

/**
 * Zustand store for user profile settings
 *
 * Migrated from MobX ProfileStore (packages/web/stores/profile.ts)
 *
 * Features:
 * - Persists avatar selection to localStorage
 * - Compatible with the same storage key as the original MobX version
 *
 * @example
 * ```tsx
 * import { useProfileStore } from "~/stores/profile-store";
 *
 * function MyComponent() {
 *   const { currentAvatar, setCurrentAvatar } = useProfileStore();
 *
 *   return (
 *     <button onClick={() => setCurrentAvatar("ammelia")}>
 *       Current: {currentAvatar}
 *     </button>
 *   );
 * }
 * ```
 */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      currentAvatar: "wosmongton",
      setCurrentAvatar: (avatar: Avatar) => set({ currentAvatar: avatar }),
    }),
    {
      name: "profile-store",
      // Migrate from old MobX storage format if present
      onRehydrateStorage: () => (state) => {
        // Check if old MobX storage key exists and migrate
        if (typeof window !== "undefined") {
          const oldKey = "profile_store_current_avatar";
          const oldValue = localStorage.getItem(oldKey);
          if (oldValue && state) {
            try {
              const parsed = JSON.parse(oldValue);
              if (parsed === "ammelia" || parsed === "wosmongton") {
                state.currentAvatar = parsed;
                // Remove old key after migration
                localStorage.removeItem(oldKey);
              }
            } catch {
              // If parsing fails, try direct value
              if (oldValue === '"ammelia"' || oldValue === '"wosmongton"') {
                state.currentAvatar = oldValue.replace(/"/g, "") as Avatar;
                localStorage.removeItem(oldKey);
              }
            }
          }
        }
      },
    }
  )
);

/**
 * Hook to get only the current avatar (for components that only need to read)
 */
export const useCurrentAvatar = () =>
  useProfileStore((state) => state.currentAvatar);

/**
 * Hook to get only the setCurrentAvatar function (for components that only need to write)
 */
export const useSetCurrentAvatar = () =>
  useProfileStore((state) => state.setCurrentAvatar);
