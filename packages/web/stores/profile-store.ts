import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export type Avatar = "wosmongton" | "ammelia";

const PROFILE_STORE_KEY = "profile-store";
/** Set once legacy MobX keys have been migrated, so later visits skip the
 *  localStorage reads. */
const LEGACY_MIGRATION_COMPLETE_KEY = "profile-store/legacy-migration-complete";

/** Avatar selection, persisted to localStorage. */
export const useProfileStore = create(
  persist(
    combine(
      {
        currentAvatar: "wosmongton" as Avatar,
      },
      (set) => ({
        setCurrentAvatar: (avatar: Avatar) => set({ currentAvatar: avatar }),
      })
    ),
    {
      name: PROFILE_STORE_KEY,
      // Migrate from old MobX storage format if present
      onRehydrateStorage: (state) => () => {
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
            localStorage.setItem(
              PROFILE_STORE_KEY,
              JSON.stringify({
                state: {
                  ...(state ?? { currentAvatar: "wosmongton" }),
                  currentAvatar: parsedValue,
                },
              })
            );
            state?.setCurrentAvatar(parsedValue);
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
