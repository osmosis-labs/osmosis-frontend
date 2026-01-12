import { Dec } from "@osmosis-labs/unit";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Supported language options
 */
export const SUPPORTED_LANGUAGES = [
  { value: "en", display: "English" },
  { value: "es", display: "Español" },
  { value: "fr", display: "Français" },
  { value: "ko", display: "한국어" },
  { value: "pl", display: "Polski" },
  { value: "pt-br", display: "Portuguese" },
  { value: "ro", display: "Romana" },
  { value: "tr", display: "Türkçe" },
  { value: "zh-cn", display: "简体中文" },
  { value: "zh-tw", display: "正體中文" },
  { value: "zh-hk", display: "香港語" },
  { value: "fa", display: "فارسی" },
  { value: "ja", display: "日本語" },
  { value: "de", display: "Deutsch" },
  { value: "hi", display: "हिन्दी" },
  { value: "ru", display: "Русский" },
  { value: "gu", display: "ગુજરાતી" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["value"];

/**
 * Global dust threshold in USD fiat value
 */
export const DUST_THRESHOLD = new Dec(0.02);

/**
 * User settings state interface
 */
interface UserSettingsState {
  /** Whether to hide small balances (dust) */
  hideDust: boolean;
  /** Whether to hide all balances for privacy */
  hideBalances: boolean;
  /** Current language setting */
  language: string;
  /** Whether to show unverified assets */
  showUnverifiedAssets: boolean;

  /** Set hide dust preference */
  setHideDust: (value: boolean) => void;
  /** Set hide balances preference */
  setHideBalances: (value: boolean) => void;
  /** Set language preference */
  setLanguage: (value: string) => void;
  /** Set show unverified assets preference */
  setShowUnverifiedAssets: (value: boolean) => void;
}

const initialState = {
  hideDust: false,
  hideBalances: false,
  language: "en",
  showUnverifiedAssets: false,
};

/**
 * Migrate from old MobX storage format
 */
function migrateFromOldStorage(
  state: typeof initialState
): typeof initialState {
  if (typeof window === "undefined") return state;

  const newState = { ...state };

  // Try to migrate hide-dust
  const oldHideDust = localStorage.getItem("hide-dust");
  if (oldHideDust) {
    try {
      const parsed = JSON.parse(oldHideDust);
      if (typeof parsed?.hideDust === "boolean") {
        newState.hideDust = parsed.hideDust;
      }
      localStorage.removeItem("hide-dust");
    } catch {
      // Ignore parsing errors
    }
  }

  // Try to migrate hide-balances
  const oldHideBalances = localStorage.getItem("hide-balances");
  if (oldHideBalances) {
    try {
      const parsed = JSON.parse(oldHideBalances);
      if (typeof parsed?.hideBalances === "boolean") {
        newState.hideBalances = parsed.hideBalances;
      }
      localStorage.removeItem("hide-balances");
    } catch {
      // Ignore parsing errors
    }
  }

  // Try to migrate language
  const oldLanguage = localStorage.getItem("language");
  if (oldLanguage) {
    try {
      const parsed = JSON.parse(oldLanguage);
      if (typeof parsed?.language === "string") {
        newState.language = parsed.language;
      }
      localStorage.removeItem("language");
    } catch {
      // Ignore parsing errors
    }
  }

  // Try to migrate unverified-assets
  const oldUnverified = localStorage.getItem("unverified-assets");
  if (oldUnverified) {
    try {
      const parsed = JSON.parse(oldUnverified);
      if (typeof parsed?.showUnverifiedAssets === "boolean") {
        newState.showUnverifiedAssets = parsed.showUnverifiedAssets;
      }
      localStorage.removeItem("unverified-assets");
    } catch {
      // Ignore parsing errors
    }
  }

  return newState;
}

/**
 * Zustand store for user settings
 *
 * Migrated from MobX UserSettings (packages/web/stores/user-settings/)
 *
 * Features:
 * - Persists all settings to localStorage
 * - Migrates from old MobX storage format
 * - Individual setters for each setting
 *
 * @example
 * ```tsx
 * import { useUserSettingsStore } from "~/stores/user-settings-store";
 *
 * function MyComponent() {
 *   const { hideDust, setHideDust, language } = useUserSettingsStore();
 *
 *   return (
 *     <div>
 *       <p>Language: {language}</p>
 *       <button onClick={() => setHideDust(!hideDust)}>
 *         {hideDust ? "Show Dust" : "Hide Dust"}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useUserSettingsStore = create<UserSettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setHideDust: (value) => set({ hideDust: value }),
      setHideBalances: (value) => set({ hideBalances: value }),
      setLanguage: (value) => set({ language: value }),
      setShowUnverifiedAssets: (value) => set({ showUnverifiedAssets: value }),
    }),
    {
      name: "user-settings-store",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const migrated = migrateFromOldStorage(state);
          if (
            migrated.hideDust !== state.hideDust ||
            migrated.hideBalances !== state.hideBalances ||
            migrated.language !== state.language ||
            migrated.showUnverifiedAssets !== state.showUnverifiedAssets
          ) {
            useUserSettingsStore.setState(migrated);
          }
        }
      },
    }
  )
);

// ============================================================================
// Convenience hooks for accessing individual settings
// ============================================================================

/** Hook to get/set hide dust setting */
export const useHideDust = () => {
  const hideDust = useUserSettingsStore((state) => state.hideDust);
  const setHideDust = useUserSettingsStore((state) => state.setHideDust);
  return { hideDust, setHideDust };
};

/** Hook to get/set hide balances setting */
export const useHideBalances = () => {
  const hideBalances = useUserSettingsStore((state) => state.hideBalances);
  const setHideBalances = useUserSettingsStore(
    (state) => state.setHideBalances
  );
  return { hideBalances, setHideBalances };
};

/** Hook to get/set language setting */
export const useLanguageSetting = () => {
  const language = useUserSettingsStore((state) => state.language);
  const setLanguage = useUserSettingsStore((state) => state.setLanguage);
  return { language, setLanguage };
};

/** Hook to get/set show unverified assets setting */
export const useShowUnverifiedAssets = () => {
  const showUnverifiedAssets = useUserSettingsStore(
    (state) => state.showUnverifiedAssets
  );
  const setShowUnverifiedAssets = useUserSettingsStore(
    (state) => state.setShowUnverifiedAssets
  );
  return { showUnverifiedAssets, setShowUnverifiedAssets };
};
