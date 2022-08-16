import { TxEventMap, WsReadyState } from "./types";
declare type Listeners = {
    [K in keyof TxEventMap]?: TxEventMap[K][];
};
/**
 * TxTracer is almost same with the `TendermintTxTracer` in the @keplr-wallet/cosmos library.
 * Changes for some mistake on the original `TendermintTxTracer` and this would be remove if the changes are merged to the original library.
 */
export declare class TxTracer {
    protected readonly url: string;
    protected readonly wsEndpoint: string;
    protected readonly options: {
        wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    };
    protected ws: WebSocket;
    protected newBlockSubscribes: {
        handler: (block: any) => void;
    }[];
    protected txSubscribes: Map<number, {
        params: Record<string, string | number | boolean>;
        resolver: (data?: unknown) => void;
        rejector: (e: Error) => void;
    }>;
    protected pendingQueries: Map<number, {
        method: string;
        params: Record<string, string | number | boolean>;
        resolver: (data?: unknown) => void;
        rejector: (e: Error) => void;
    }>;
    protected listeners: Listeners;
    constructor(url: string, wsEndpoint: string, options?: {
        wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    });
    protected getWsEndpoint(): string;
    open(): void;
    close(): void;
    get numberOfSubscriberOrPendingQuery(): number;
    get readyState(): WsReadyState;
    addEventListener<T extends keyof TxEventMap>(type: T, listener: TxEventMap[T]): void;
    protected readonly onOpen: (e: Event) => void;
    protected readonly onMessage: (e: MessageEvent) => void;
    protected readonly onClose: (e: CloseEvent) => void;
    /**
     * SubscribeBlock receives the handler for the block.
     * The handelrs shares the subscription of block.
     * @param handler
     * @return unsubscriber
     */
    subscribeBlock(handler: (block: any) => void): () => void;
    protected sendSubscribeBlockRpc(): void;
    traceTx(query: Uint8Array | Record<string, string | number | boolean>): Promise<any>;
    subscribeTx(query: Uint8Array | Record<string, string | number | boolean>): Promise<any>;
    protected sendSubscribeTxRpc(id: number, params: Record<string, string | number | boolean>): void;
    queryTx(query: Uint8Array | Record<string, string | number | boolean>): Promise<any>;
    protected query(method: string, params: Record<string, string | number | boolean>): Promise<any>;
    protected sendQueryRpc(id: number, method: string, params: Record<string, string | number | boolean>): void;
    protected createRandomId(): number;
}
export {};
