import { t } from "react-multi-lang";

export interface Alert {
  message: Parameters<typeof t> | string;
  caption?: Parameters<typeof t> | string;
  learnMoreUrl?: string;
  learnMoreUrlCaption?: string;
}

export const enum ToastType {
  SUCCESS,
  ERROR,
  LOADING,
}
