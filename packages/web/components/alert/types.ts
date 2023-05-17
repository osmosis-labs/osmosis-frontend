export interface Alert {
  message: string;
  caption?: string;
  learnMoreUrl?: string;
  learnMoreUrlCaption?: string;
}

export const enum ToastType {
  SUCCESS,
  ERROR,
  LOADING,
}
