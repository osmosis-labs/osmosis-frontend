import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export class PollingStatusSubscription {
  protected readonly rpcInstance: AxiosInstance;

  protected _subscriptionCount: number = 0;

  protected _handlers: ((data: any) => void)[] = [];

  constructor(
    protected readonly rpc: string,
    protected readonly rpcConfig?: AxiosRequestConfig
  ) {
    this.rpcInstance = Axios.create({
      ...{
        baseURL: rpc,
      },
      ...rpcConfig,
    });
  }

  get subscriptionCount(): number {
    return this._subscriptionCount;
  }

  /**
   * @param handler
   * @return unsubscriber
   */
  subscribe(handler: (data: any) => void): () => void {
    this._handlers.push(handler);

    this.increaseSubscriptionCount();

    return () => {
      this._handlers = this._handlers.filter((h) => h !== handler);
      this.decreaseSubscriptionCount();
    };
  }

  protected async startSubscription() {
    while (this._subscriptionCount > 0) {
      await new Promise((resolve) => {
        // 7.5 sec.
        setTimeout(resolve, 7500);
      });

      try {
        const response = await this.rpcInstance.get("/status");
        if (response.status === 200) {
          this._handlers.forEach((handler) => handler(response.data));
        }
      } catch (e: any) {
        console.error(`Failed to fetch /status: ${e?.toString()}`);
      }
    }
  }

  protected increaseSubscriptionCount() {
    this._subscriptionCount++;

    if (this._subscriptionCount === 1) {
      // No need to await
      this.startSubscription();
    }
  }

  protected decreaseSubscriptionCount() {
    this._subscriptionCount--;
  }
}
