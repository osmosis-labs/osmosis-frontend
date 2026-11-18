import { act, renderHook, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import type { PropsWithChildren } from "react";

import {
  SUPPORTED_LANGUAGES,
  useUserSettingsStore,
} from "~/stores/user-settings-store";

import { MultiLanguageProvider, useTranslation } from "../../language/context";
import { useCurrentLanguage } from "../use-current-language";

jest.mock("~/hooks", () => jest.requireActual("~/hooks/language/context"));

const wrapper = ({ children }: PropsWithChildren) => (
  <MultiLanguageProvider>{children}</MultiLanguageProvider>
);

afterEach(() => {
  useUserSettingsStore.setState({ language: "en" });
  dayjs.locale("en");
});

it.each(SUPPORTED_LANGUAGES)(
  "restores $value translations and date formatting after the English initial render",
  async ({ value }) => {
    useUserSettingsStore.setState({ language: value });
    const { result } = renderHook(
      () => {
        useCurrentLanguage();
        return useTranslation();
      },
      { wrapper }
    );

    expect(result.current.language).toBe("en");

    await waitFor(() => {
      expect(result.current.language).toBe(value);
      expect(result.current.translations[value].menu.portfolio).toBeDefined();
      expect(result.current.t("menu.portfolio")).toBe(
        result.current.translations[value].menu.portfolio
      );
      expect(dayjs.locale()).toBe(value);
    });

    act(() => useUserSettingsStore.getState().setLanguage("en"));

    await waitFor(() => {
      expect(result.current.language).toBe("en");
      expect(result.current.t("menu.portfolio")).toBe("Portfolio");
      expect(dayjs.locale()).toBe("en");
    });
  }
);
