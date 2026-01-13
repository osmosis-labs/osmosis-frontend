/* eslint-disable import/no-extraneous-dependencies */
import { renderHook } from "@testing-library/react";

import { useUserSettingsStore } from "../../../stores/user-settings-store";
import { useCurrentLanguage } from "../use-current-language";

// Mock the hooks and imports to avoid side effects
jest.mock("../../../hooks", () => ({
  useTranslation: () => ({
    changeLanguage: jest.fn(),
    changeTranslations: jest.fn(),
  }),
}));

describe("useCurrentLanguage", () => {
  beforeEach(() => {
    // Reset store to initial state
    useUserSettingsStore.setState({
      hideDust: false,
      hideBalances: false,
      language: "en",
      showUnverifiedAssets: false,
    });
  });

  it("should return current language from store", () => {
    useUserSettingsStore.setState({ language: "es" });

    const { result } = renderHook(() => useCurrentLanguage());

    expect(result.current).toBe("es");
  });

  it("should return 'en' as default", () => {
    useUserSettingsStore.setState({ language: "en" });

    const { result } = renderHook(() => useCurrentLanguage());

    expect(result.current).toBe("en");
  });

  it("should return 'en' when language is undefined", () => {
    // TypeScript doesn't allow undefined but testing the fallback anyway
    useUserSettingsStore.setState({ language: undefined as any });

    const { result } = renderHook(() => useCurrentLanguage());

    expect(result.current).toBe("en");
  });

  it("should return different languages correctly", () => {
    const languages = ["fr", "ko", "zh-cn", "de", "ja"];

    for (const lang of languages) {
      useUserSettingsStore.setState({ language: lang });

      const { result } = renderHook(() => useCurrentLanguage());

      expect(result.current).toBe(lang);
    }
  });
});
