export enum WsReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
  // WS is not initialized or the ready state of WS is unknown
  NONE,
}

export interface TxEventMap {
  close: (e: CloseEvent) => void;
  error: (e: ErrorEvent) => void;
  message: (e: MessageEvent) => void;
  open: (e: Event) => void;
}

// This is a placeholder for the tx timeout error that web package
// uses to detect the tx timeout error and translate it to the
// user friendly error.
export const txTimedOutErrorPlaceholder = "txTimedOutError";
// This is a snipper returned by the node when the tx is timed out.
// We use it to detect the tx timeout error.
export const txTimedOutChainErrorMsg = "tx timeout height";
