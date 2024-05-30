import { ReactNode } from "react";

import { MultiLanguageT, TranslationPath } from "~/hooks";

export interface Alert {
  titleTranslationKey: TranslationPath;
  captionTranslationKey?: Parameters<MultiLanguageT> | TranslationPath;
  captionElement?: ReactNode;
  learnMoreUrl?: string;
  learnMoreUrlCaption?: string;
}

export const enum ToastType {
  SUCCESS,
  ERROR,
  LOADING,
  ONE_CLICK_TRADING,
}
