export declare enum WsReadyState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3,
    NONE = 4
}
export interface TxEventMap {
    close: (e: CloseEvent) => void;
    error: (e: ErrorEvent) => void;
    message: (e: MessageEvent) => void;
    open: (e: Event) => void;
}
