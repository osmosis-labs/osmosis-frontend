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
 * Once legacy MobX keys have been checked/migrated, we can skip future checks.
 * This avoids repeated localStorage reads on subsequent visits.
 */
const LEGACY_MIGRATION_COMPLETE_KEY =
  "user-settings-store/legacy-migration-complete";

/**
 * Migrate from old MobX storage format
 */
function migrateFromOldStorage(state: UserSettingsData): UserSettingsData {
  if (typeof window === "undefined") return state;

  // If we've already verified/migrated legacy keys, skip further checks.
  if (localStorage.getItem(LEGACY_MIGRATION_COMPLETE_KEY) === "1") return state;

  // Read legacy values once so we can early-exit cheaply.
  const hideDustKey = "hide-dust";
  const namespacedHideDustKey = "user_setting/hide-dust";
  const oldHideDustNamespaced = localStorage.getItem(namespacedHideDustKey);
  const oldHideDustUnprefixed = localStorage.getItem(hideDustKey);

  const hideBalancesKey = "hide-balances";
  const namespacedHideBalancesKey = "user_setting/hide-balances";
  const oldHideBalancesNamespaced = localStorage.getItem(
    namespacedHideBalancesKey
  );
  const oldHideBalancesUnprefixed = localStorage.getItem(hideBalancesKey);

  const languageKey = "language";
  const namespacedLanguageKey = "user_setting/language";
  const oldLanguageNamespaced = localStorage.getItem(namespacedLanguageKey);
  const oldLanguageUnprefixed = localStorage.getItem(languageKey);

  const unverifiedAssetsKey = "unverified-assets";
  const namespacedUnverifiedAssetsKey = "user_setting/unverified-assets";
  const oldUnverifiedNamespaced = localStorage.getItem(
    namespacedUnverifiedAssetsKey
  );
  const oldUnverifiedUnprefixed = localStorage.getItem(unverifiedAssetsKey);

  const hasAnyLegacyValues =
    oldHideDustNamespaced !== null ||
    oldHideDustUnprefixed !== null ||
    oldHideBalancesNamespaced !== null ||
    oldHideBalancesUnprefixed !== null ||
    oldLanguageNamespaced !== null ||
    oldLanguageUnprefixed !== null ||
    oldUnverifiedNamespaced !== null ||
    oldUnverifiedUnprefixed !== null;

  if (!hasAnyLegacyValues) {
    localStorage.setItem(LEGACY_MIGRATION_COMPLETE_KEY, "1");
    return state;
  }

  const newState: UserSettingsData = {
    hideDust: state.hideDust,
    hideBalances: state.hideBalances,
    language: state.language,
    showUnverifiedAssets: state.showUnverifiedAssets,
  };

  let didEncounterParseError = false;

  // Try to migrate hide-dust
  const oldHideDust = oldHideDustNamespaced ?? oldHideDustUnprefixed;
  if (oldHideDust !== null) {
    try {
      const parsed = JSON.parse(oldHideDust);
      if (typeof parsed?.hideDust === "boolean") {
        newState.hideDust = parsed.hideDust;
      }
      if (oldHideDustNamespaced !== null)
        localStorage.removeItem(namespacedHideDustKey);
      if (oldHideDustUnprefixed !== null) localStorage.removeItem(hideDustKey);
    } catch {
      didEncounterParseError = true;
      // Ignore parsing errors
    }
  }

  // Try to migrate hide-balances
  const oldHideBalances =
    oldHideBalancesNamespaced ?? oldHideBalancesUnprefixed;
  if (oldHideBalances !== null) {
    try {
      const parsed = JSON.parse(oldHideBalances);
      if (typeof parsed?.hideBalances === "boolean") {
        newState.hideBalances = parsed.hideBalances;
      }
      if (oldHideBalancesNamespaced !== null)
        localStorage.removeItem(namespacedHideBalancesKey);
      if (oldHideBalancesUnprefixed !== null)
        localStorage.removeItem(hideBalancesKey);
    } catch {
      didEncounterParseError = true;
      // Ignore parsing errors
    }
  }

  // Try to migrate language
  const oldLanguage = oldLanguageNamespaced ?? oldLanguageUnprefixed;
  if (oldLanguage !== null) {
    try {
      const parsed = JSON.parse(oldLanguage);
      if (isSupportedLanguage(parsed?.language)) {
        newState.language = parsed.language;
      }
      if (oldLanguageNamespaced !== null)
        localStorage.removeItem(namespacedLanguageKey);
      if (oldLanguageUnprefixed !== null) localStorage.removeItem(languageKey);
    } catch {
      didEncounterParseError = true;
      // Ignore parsing errors
    }
  }

  // Try to migrate unverified-assets
  const oldUnverified = oldUnverifiedNamespaced ?? oldUnverifiedUnprefixed;
  if (oldUnverified !== null) {
    try {
      const parsed = JSON.parse(oldUnverified);
      if (typeof parsed?.showUnverifiedAssets === "boolean") {
        newState.showUnverifiedAssets = parsed.showUnverifiedAssets;
      }
      if (oldUnverifiedNamespaced !== null)
        localStorage.removeItem(namespacedUnverifiedAssetsKey);
      if (oldUnverifiedUnprefixed !== null)
        localStorage.removeItem(unverifiedAssetsKey);
    } catch {
      didEncounterParseError = true;
      // Ignore parsing errors
    }
  }

  // Only mark complete if all legacy values were parseable (and thus removed).
  if (!didEncounterParseError) {
    localStorage.setItem(LEGACY_MIGRATION_COMPLETE_KEY, "1");
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
