import { AxiosInstance, AxiosRequestConfig } from "axios";
/** Polls a `/status` endpoint on a given Axios RPC config and publishes to an arbitrary set of subsribers. */
export declare class PollingStatusSubscription {
    protected readonly rpc: string;
    protected readonly rpcConfig?: AxiosRequestConfig<any> | undefined;
    protected readonly rpcInstance: AxiosInstance;
    protected _subscriptionCount: number;
    protected _handlers: ((data: any) => void)[];
    constructor(rpc: string, rpcConfig?: AxiosRequestConfig<any> | undefined);
    get subscriptionCount(): number;
    /**
     * @param handler
     * @return unsubscriber
     */
    subscribe(handler: (data: any) => void): () => void;
    protected startSubscription(): Promise<void>;
    protected increaseSubscriptionCount(): void;
    protected decreaseSubscriptionCount(): void;
}
