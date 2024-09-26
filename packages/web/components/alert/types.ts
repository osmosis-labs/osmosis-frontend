import { ReactNode } from "react";

import { MultiLanguageT, TranslationPath } from "~/hooks";

export interface Alert {
  titleTranslationKey: TranslationPath;
  captionTranslationKey?: Parameters<MultiLanguageT> | TranslationPath;
  captionElement?: ReactNode;
  learnMoreUrl?: string;
  learnMoreUrlCaption?: string;
  iconElement?: ReactNode;
}

export const enum ToastType {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  LOADING = "LOADING",
  ONE_CLICK_TRADING = "ONE_CLICK_TRADING",
  ALLOYED_ASSETS = "ALLOYED_ASSETS", // Add this line
}
