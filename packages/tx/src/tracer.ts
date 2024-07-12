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

  constructor(
    protected readonly url: string,
    protected readonly wsEndpoint: string = "/websocket",
    protected readonly options: {
      wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    } = {}
  ) {
    this.open();
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
    this.ws = this.options.wsObject
      ? new this.options.wsObject(this.getWsEndpoint())
      : new WebSocket(this.getWsEndpoint());
    this.ws.onopen = this.onOpen;
    this.ws.onmessage = this.onMessage;
    this.ws.onclose = this.onClose;
  }

  close() {
    this.ws.close();
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
    for (const listener of this.listeners.close ?? []) {
      listener(e);
    }
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
          `tm.event='Tx' and ` +
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
            .join(" and "),
        page: "1",
        per_page: "1",
        order_by: "desc",
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
          .join(" and "),
        page: "1",
        per_page: "1",
        order_by: "desc",
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
