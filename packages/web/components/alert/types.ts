import { ReactNode } from "react";

import { MultiLanguageT } from "~/hooks";

export interface Alert {
  titleTranslationKey: string;
  captionTranslationKey?: Parameters<MultiLanguageT> | string;
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
