import { AxiosInstance, AxiosRequestConfig } from "axios";
export declare class PollingStatusSubscription {
    protected readonly rpc: string;
    protected readonly rpcConfig?: AxiosRequestConfig | undefined;
    protected readonly rpcInstance: AxiosInstance;
    protected _subscriptionCount: number;
    protected _handlers: ((data: any) => void)[];
    constructor(rpc: string, rpcConfig?: AxiosRequestConfig | undefined);
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
