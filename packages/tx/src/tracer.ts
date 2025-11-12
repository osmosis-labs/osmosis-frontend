import { Buffer } from "buffer";

enum WsReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
  // WS is not initialized or the ready state of WS is unknown
  NONE,
}

interface TxEventMap {
  close: (e: CloseEvent) => void;
  error: (e: ErrorEvent) => void;
  message: (e: MessageEvent) => void;
  open: (e: Event) => void;
}

type Listeners = {
  [K in keyof TxEventMap]?: TxEventMap[K][];
};

/**
 * Subscribes to new blocks and transactions by attaching a WebSocket connection to the
 * chain's RPC endpoint. This allows for real-time updates on the chain's state.
 *
 * Supports multiple WebSocket endpoints with automatic failover. If the connection fails,
 * will automatically try the next endpoint with exponential backoff.
 *
 * Create one instance per block or tx subscription.
 */
export class TxTracer {
  protected ws!: WebSocket;

  protected newBlockSubscribes: {
    handler: (block: any) => void;
  }[] = [];
  // Key is "id" for jsonrpc
  protected txSubscribes: Map<
    number,
    {
      params: Record<string, string | number | boolean>;
      resolver: (data?: unknown) => void;
      rejector: (e: Error) => void;
    }
  > = new Map();

  // Key is "id" for jsonrpc
  protected pendingQueries: Map<
    number,
    {
      method: string;
      params: Record<string, string | number | boolean>;
      resolver: (data?: unknown) => void;
      rejector: (e: Error) => void;
    }
  > = new Map();

  protected listeners: Listeners = {};

  // Multi-endpoint support
  protected readonly urls: string[];
  protected currentUrlIndex: number = 0;
  protected reconnectAttempts: number = 0;
  protected maxReconnectAttempts: number = 3;
  protected reconnectTimeoutId?: NodeJS.Timeout;
  protected isManualClose: boolean = false;

  /**
   * @param url - Single RPC URL or array of RPC URLs for multi-endpoint failover
   * @param wsEndpoint - WebSocket endpoint path (default: "/websocket")
   * @param options - Additional options including custom WebSocket constructor
   */
  constructor(
    url: string | string[],
    protected readonly wsEndpoint: string = "/websocket",
    protected readonly options: {
      wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
      /** Maximum reconnect attempts per endpoint before trying next. Default: 3 */
      maxReconnectAttempts?: number;
    } = {}
  ) {
    // Support both single string (backward compatible) and array of URLs
    this.urls = Array.isArray(url) ? url : [url];

    if (this.urls.length === 0) {
      throw new Error("At least one RPC URL must be provided");
    }

    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 3;

    this.open();
  }

  /** Get the current RPC URL being used */
  protected get url(): string {
    return this.urls[this.currentUrlIndex];
  }

  protected getWsEndpoint(): string {
    let url = this.url;
    if (url.startsWith("http")) {
      url = url.replace("http", "ws");
    }
    if (!url.endsWith(this.wsEndpoint)) {
      const wsEndpoint = this.wsEndpoint.startsWith("/")
        ? this.wsEndpoint
        : "/" + this.wsEndpoint;

      url = url.endsWith("/") ? url + wsEndpoint.slice(1) : url + wsEndpoint;
    }

    return url;
  }

  open() {
    const wsUrl = this.getWsEndpoint();
    console.log(`[TxTracer] Connecting to WebSocket: ${wsUrl}`);

    this.ws = this.options.wsObject
      ? new this.options.wsObject(wsUrl)
      : new WebSocket(wsUrl);
    this.ws.onopen = this.onOpen;
    this.ws.onmessage = this.onMessage;
    this.ws.onclose = this.onClose;
    this.ws.onerror = this.onError;
  }

  close() {
    this.isManualClose = true;
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = undefined;
    }
    this.ws.close();
  }

  /**
   * Attempt to reconnect with exponential backoff and endpoint failover.
   * Tries the current endpoint multiple times before moving to the next one.
   */
  protected reconnect() {
    if (this.isManualClose) {
      console.log("[TxTracer] Manual close, not reconnecting");
      return;
    }

    this.reconnectAttempts++;

    // Check if we should try the next endpoint
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      this.reconnectAttempts = 0;
      const previousIndex = this.currentUrlIndex;
      this.currentUrlIndex = (this.currentUrlIndex + 1) % this.urls.length;

      // If we've tried all endpoints, wait longer before cycling again
      if (this.currentUrlIndex === 0 && this.urls.length > 1) {
        console.warn(
          `[TxTracer] All ${this.urls.length} endpoints failed. Cycling back to first endpoint after delay.`
        );
        // Wait 10 seconds before trying all endpoints again
        this.reconnectTimeoutId = setTimeout(() => {
          this.open();
        }, 10000);
        return;
      }

      console.warn(
        `[TxTracer] Switching from endpoint ${previousIndex} to ${this.currentUrlIndex}`
      );
    }

    // Exponential backoff: 1s, 2s, 4s
    const backoffDelay = Math.min(Math.pow(2, this.reconnectAttempts - 1) * 1000, 8000);

    console.log(
      `[TxTracer] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} ` +
        `for endpoint ${this.currentUrlIndex} in ${backoffDelay}ms`
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.open();
    }, backoffDelay);
  }

  get numberOfSubscriberOrPendingQuery(): number {
    return (
      this.newBlockSubscribes.length +
      this.txSubscribes.size +
      this.pendingQueries.size
    );
  }

  get readyState(): WsReadyState {
    switch (this.ws.readyState) {
      case 0:
        return WsReadyState.CONNECTING;
      case 1:
        return WsReadyState.OPEN;
      case 2:
        return WsReadyState.CLOSING;
      case 3:
        return WsReadyState.CLOSED;
      default:
        return WsReadyState.NONE;
    }
  }

  addEventListener<T extends keyof TxEventMap>(
    type: T,
    listener: TxEventMap[T]
  ) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.listeners[type]!.push(listener);
  }

  protected readonly onOpen = (e: Event) => {
    console.log(`[TxTracer] WebSocket connected successfully to ${this.url}`);

    // Reset reconnect attempts on successful connection
    this.reconnectAttempts = 0;
    this.isManualClose = false;

    if (this.newBlockSubscribes.length > 0) {
      this.sendSubscribeBlockRpc();
    }

    for (const [id, tx] of this.txSubscribes) {
      this.sendSubscribeTxRpc(id, tx.params);
    }

    for (const [id, query] of this.pendingQueries) {
      this.sendQueryRpc(id, query.method, query.params);
    }

    for (const listener of this.listeners.open ?? []) {
      listener(e);
    }
  };

  protected readonly onMessage = (e: MessageEvent) => {
    for (const listener of this.listeners.message ?? []) {
      listener(e);
    }

    if (e.data) {
      try {
        const obj = JSON.parse(e.data);

        if (obj?.id) {
          if (this.pendingQueries.has(obj.id)) {
            if (obj.error) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              this.pendingQueries
                .get(obj.id)!
                .rejector(new Error(obj.error.data || obj.error.message));
            } else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              this.pendingQueries.get(obj.id)!.resolver(obj.result);
            }

            this.pendingQueries.delete(obj.id);
          }
        }

        if (obj?.result?.data?.type === "tendermint/event/NewBlock") {
          for (const handler of this.newBlockSubscribes) {
            handler.handler(obj.result.data.value);
          }
        }

        if (obj?.result?.data?.type === "tendermint/event/Tx") {
          if (obj?.id) {
            if (this.txSubscribes.has(obj.id)) {
              if (obj.error) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.txSubscribes
                  .get(obj.id)!
                  .rejector(new Error(obj.error.data || obj.error.message));
              } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.txSubscribes
                  .get(obj.id)!
                  .resolver(obj.result.data.value.TxResult.result);
              }

              this.txSubscribes.delete(obj.id);
            }
          }
        }
      } catch (e: any) {
        console.error(
          `Tendermint websocket jsonrpc response is not JSON: ${
            e.message || e.toString()
          }`
        );
      }
    }
  };

  protected readonly onClose = (e: CloseEvent) => {
    console.warn(
      `[TxTracer] WebSocket closed. Code: ${e.code}, Reason: ${e.reason || "No reason provided"}`
    );

    for (const listener of this.listeners.close ?? []) {
      listener(e);
    }

    // Attempt to reconnect unless this was a manual close
    if (!this.isManualClose) {
      this.reconnect();
    }
  };

  protected readonly onError = (e: ErrorEvent) => {
    console.error(`[TxTracer] WebSocket error:`, e.message || e);

    for (const listener of this.listeners.error ?? []) {
      listener(e);
    }

    // Note: onError is typically followed by onClose, so reconnection
    // will be handled there. We just log the error here.
  };

  /**
   * SubscribeBlock receives the handler for the block.
   * The handlers shares the subscription of block.
   * @param handler
   * @return unsubscriber
   */
  subscribeBlock(handler: (block: any) => void): () => void {
    this.newBlockSubscribes.push({
      handler,
    });

    if (this.newBlockSubscribes.length === 1) {
      this.sendSubscribeBlockRpc();
    }

    return () => {
      this.newBlockSubscribes = this.newBlockSubscribes.filter(
        (s) => s.handler !== handler
      );
    };
  }

  protected sendSubscribeBlockRpc(): void {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "subscribe",
          params: { query: "tm.event='NewBlock'" },
          id: 1,
        })
      );
    }
  }

  /** Query and subscribe to tx with the given event query */
  traceTx(
    query: Uint8Array | Record<string, string | number | boolean>
  ): Promise<any> {
    return new Promise<any>((resolve) => {
      // At first, try to query the tx at the same time of subscribing the tx.
      // But, the querying's error will be ignored.
      this.queryTx(query)
        .then((result) => {
          if (query instanceof Uint8Array) {
            resolve(result);
            return;
          }

          if (result?.total_count !== "0") {
            resolve(result);
            return;
          }
        })
        .catch(() => {
          // noop
        });

      this.subscribeTx(query).then(resolve);
    });
  }

  subscribeTx(
    query: Uint8Array | Record<string, string | number | boolean>
  ): Promise<any> {
    if (query instanceof Uint8Array) {
      const id = this.createRandomId();

      const params = {
        query: `tm.event='Tx' AND tx.hash='${Buffer.from(query)
          .toString("hex")
          .toUpperCase()}'`,
      };

      return new Promise<unknown>((resolve, reject) => {
        this.txSubscribes.set(id, {
          params,
          resolver: resolve,
          rejector: reject,
        });

        this.sendSubscribeTxRpc(id, params);
      });
    } else {
      const id = this.createRandomId();

      const params = {
        query:
          `tm.event='Tx' AND ` +
          Object.keys(query)
            .map((key) => {
              return {
                key,
                value: query[key],
              };
            })
            .map((obj) => {
              return `${obj.key}=${
                typeof obj.value === "string" ? `'${obj.value}'` : obj.value
              }`;
            })
            .join(" AND "),
        page: "1",
        per_page: "1",
        order_by: "asc",
      };

      return new Promise<unknown>((resolve, reject) => {
        this.txSubscribes.set(id, {
          params,
          resolver: resolve,
          rejector: reject,
        });

        this.sendSubscribeTxRpc(id, params);
      });
    }
  }

  protected sendSubscribeTxRpc(
    id: number,
    params: Record<string, string | number | boolean>
  ): void {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "subscribe",
          params: params,
          id,
        })
      );
    }
  }

  queryTx(
    query: Uint8Array | Record<string, string | number | boolean>
  ): Promise<any> {
    if (query instanceof Uint8Array) {
      return this.query("tx", {
        hash: Buffer.from(query).toString("base64"),
        prove: false,
      });
    } else {
      const params = {
        query: Object.keys(query)
          .map((key) => {
            return {
              key,
              value: query[key],
            };
          })
          .map((obj) => {
            return `${obj.key}=${
              typeof obj.value === "string" ? `'${obj.value}'` : obj.value
            }`;
          })
          .join(" AND "),
        page: "1",
        per_page: "1",
        order_by: "asc",
      };

      return this.query("tx_search", params);
    }
  }

  protected query(
    method: string,
    params: Record<string, string | number | boolean>
  ): Promise<any> {
    const id = this.createRandomId();

    return new Promise<unknown>((resolve, reject) => {
      this.pendingQueries.set(id, {
        method,
        params,
        resolver: resolve,
        rejector: reject,
      });

      this.sendQueryRpc(id, method, params);
    });
  }

  protected sendQueryRpc(
    id: number,
    method: string,
    params: Record<string, string | number | boolean>
  ) {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id,
        })
      );
    }
  }

  protected createRandomId(): number {
    return parseInt(
      Array.from({ length: 6 })
        .map(() => Math.floor(Math.random() * 100))
        .join("")
    );
  }
}
