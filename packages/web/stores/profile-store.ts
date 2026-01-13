import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Avatar type - matches the original MobX ProfileStore
 */
export type Avatar = "wosmongton" | "ammelia";

/**
 * Once legacy MobX keys have been checked/migrated, we can skip future checks.
 * This avoids repeated localStorage reads on subsequent visits.
 */
const LEGACY_MIGRATION_COMPLETE_KEY = "profile-store/legacy-migration-complete";

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
      onRehydrateStorage: () => () => {
        if (typeof window === "undefined") return;

        // If we've already verified/migrated legacy keys, skip further checks.
        if (localStorage.getItem(LEGACY_MIGRATION_COMPLETE_KEY) === "1") return;

        const legacyKeys = [
          // Legacy MobX key format seen in production localStorage dumps
          "profile_store/profile_store_current_avatar",
          // Older/alternate legacy key
          "profile_store_current_avatar",
        ];

        let didMigrate = false;
        let foundAnyLegacyValue = false;

        for (const oldKey of legacyKeys) {
          const oldValue = localStorage.getItem(oldKey);
          if (oldValue === null) continue;
          foundAnyLegacyValue = true;

          let parsedValue: unknown;
          try {
            parsedValue = JSON.parse(oldValue);
          } catch {
            // If JSON.parse throws, treat oldValue as a raw unquoted string
            parsedValue = oldValue;
          }

          if (parsedValue === "ammelia" || parsedValue === "wosmongton") {
            useProfileStore.setState({ currentAvatar: parsedValue });
            localStorage.removeItem(oldKey);
            didMigrate = true;
            break;
          }
        }

        // Mark complete if we confirmed no legacy keys exist, or we successfully migrated.
        // If a legacy key exists but is malformed/unrecognized, leave this unset so we can
        // attempt migration again in future versions.
        if (!foundAnyLegacyValue || didMigrate) {
          localStorage.setItem(LEGACY_MIGRATION_COMPLETE_KEY, "1");
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
