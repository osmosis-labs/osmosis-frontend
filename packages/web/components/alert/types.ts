import { MultiLanguageT } from "~/hooks";

export interface Alert {
  message: string;
  caption?: Parameters<MultiLanguageT> | string;
  learnMoreUrl?: string;
  learnMoreUrlCaption?: string;
}

export const enum ToastType {
  SUCCESS,
  ERROR,
  LOADING,
}
