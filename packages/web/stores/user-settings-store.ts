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
 * Runtime type guard for supported languages.
 * Useful when reading persisted values (localStorage) that may be malformed.
 */
function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return (
    typeof value === "string" &&
    SUPPORTED_LANGUAGES.some((lang) => lang.value === value)
  );
}

/**
 * User settings persisted data
 */
type UserSettingsData = {
  /** Whether to hide small balances (dust) */
  hideDust: boolean;
  /** Whether to hide all balances for privacy */
  hideBalances: boolean;
  /** Current language setting */
  language: SupportedLanguage;
  /** Whether to show unverified assets */
  showUnverifiedAssets: boolean;
};

/**
 * User settings state interface (persisted data + actions)
 */
interface UserSettingsState extends UserSettingsData {
  /** Set hide dust preference */
  setHideDust: (value: boolean) => void;
  /** Set hide balances preference */
  setHideBalances: (value: boolean) => void;
  /** Set language preference */
  setLanguage: (value: SupportedLanguage) => void;
  /** Set show unverified assets preference */
  setShowUnverifiedAssets: (value: boolean) => void;
}

const initialState: UserSettingsData = {
  hideDust: false,
  hideBalances: false,
  language: "en",
  showUnverifiedAssets: false,
};

/**
 * Migrate from old MobX storage format
 */
function migrateFromOldStorage(state: UserSettingsData): UserSettingsData {
  if (typeof window === "undefined") return state;

  const newState = { ...state };

  // Try to migrate hide-dust
  const hideDustKey = "hide-dust";
  const namespacedHideDustKey = "user_setting/hide-dust";
  const oldHideDustNamespaced = localStorage.getItem(namespacedHideDustKey);
  const oldHideDustUnprefixed = localStorage.getItem(hideDustKey);
  const oldHideDust = oldHideDustNamespaced ?? oldHideDustUnprefixed;
  if (oldHideDust) {
    try {
      const parsed = JSON.parse(oldHideDust);
      if (typeof parsed?.hideDust === "boolean") {
        newState.hideDust = parsed.hideDust;
      }
      if (oldHideDustNamespaced) localStorage.removeItem(namespacedHideDustKey);
      if (oldHideDustUnprefixed) localStorage.removeItem(hideDustKey);
    } catch {
      // Ignore parsing errors
    }
  }

  // Try to migrate hide-balances
  const hideBalancesKey = "hide-balances";
  const namespacedHideBalancesKey = "user_setting/hide-balances";
  const oldHideBalancesNamespaced = localStorage.getItem(
    namespacedHideBalancesKey
  );
  const oldHideBalancesUnprefixed = localStorage.getItem(hideBalancesKey);
  const oldHideBalances =
    oldHideBalancesNamespaced ?? oldHideBalancesUnprefixed;
  if (oldHideBalances) {
    try {
      const parsed = JSON.parse(oldHideBalances);
      if (typeof parsed?.hideBalances === "boolean") {
        newState.hideBalances = parsed.hideBalances;
      }
      if (oldHideBalancesNamespaced)
        localStorage.removeItem(namespacedHideBalancesKey);
      if (oldHideBalancesUnprefixed) localStorage.removeItem(hideBalancesKey);
    } catch {
      // Ignore parsing errors
    }
  }

  // Try to migrate language
  const languageKey = "language";
  const namespacedLanguageKey = "user_setting/language";
  const oldLanguageNamespaced = localStorage.getItem(namespacedLanguageKey);
  const oldLanguageUnprefixed = localStorage.getItem(languageKey);
  const oldLanguage = oldLanguageNamespaced ?? oldLanguageUnprefixed;
  if (oldLanguage) {
    try {
      const parsed = JSON.parse(oldLanguage);
      if (isSupportedLanguage(parsed?.language)) {
        newState.language = parsed.language;
      }
      if (oldLanguageNamespaced) localStorage.removeItem(namespacedLanguageKey);
      if (oldLanguageUnprefixed) localStorage.removeItem(languageKey);
    } catch {
      // Ignore parsing errors
    }
  }

  // Try to migrate unverified-assets
  const unverifiedAssetsKey = "unverified-assets";
  const namespacedUnverifiedAssetsKey = "user_setting/unverified-assets";
  const oldUnverifiedNamespaced = localStorage.getItem(
    namespacedUnverifiedAssetsKey
  );
  const oldUnverifiedUnprefixed = localStorage.getItem(unverifiedAssetsKey);
  const oldUnverified = oldUnverifiedNamespaced ?? oldUnverifiedUnprefixed;
  if (oldUnverified) {
    try {
      const parsed = JSON.parse(oldUnverified);
      if (typeof parsed?.showUnverifiedAssets === "boolean") {
        newState.showUnverifiedAssets = parsed.showUnverifiedAssets;
      }
      if (oldUnverifiedNamespaced)
        localStorage.removeItem(namespacedUnverifiedAssetsKey);
      if (oldUnverifiedUnprefixed) localStorage.removeItem(unverifiedAssetsKey);
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
