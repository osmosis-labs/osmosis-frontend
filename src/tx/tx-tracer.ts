import { TxEventMap, WsReadyState } from './types';

import { Buffer } from 'buffer/';

type Listeners = {
	[K in keyof TxEventMap]?: TxEventMap[K][];
};

/**
 * TxTracer is almost same with the `TendermintTxTracer` in the @keplr-wallet/cosmos library.
 * Changes for some mistake on the original `TendermintTxTracer` and this would be remove if the changes are merged to the original library.
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
		protected readonly wsEndpoint: string,
		protected readonly options: {
			wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
		} = {}
	) {
		this.open();
	}

	protected getWsEndpoint(): string {
		let url = this.url;
		if (url.startsWith('http')) {
			url = url.replace('http', 'ws');
		}
		if (!url.endsWith(this.wsEndpoint)) {
			const wsEndpoint = this.wsEndpoint.startsWith('/') ? this.wsEndpoint : '/' + this.wsEndpoint;

			url = url.endsWith('/') ? url + wsEndpoint.slice(1) : url + wsEndpoint;
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
		return this.newBlockSubscribes.length + this.txSubscribes.size + this.pendingQueries.size;
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

	addEventListener<T extends keyof TxEventMap>(type: T, listener: TxEventMap[T]) {
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
							this.pendingQueries.get(obj.id)!.rejector(new Error(obj.error.data || obj.error.message));
						} else {
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							this.pendingQueries.get(obj.id)!.resolver(obj.result);
						}

						this.pendingQueries.delete(obj.id);
					}
				}

				if (obj?.result?.data?.type === 'tendermint/event/NewBlock') {
					for (const handler of this.newBlockSubscribes) {
						handler.handler(obj.result.data.value);
					}
				}

				if (obj?.result?.data?.type === 'tendermint/event/Tx') {
					if (obj?.id) {
						if (this.txSubscribes.has(obj.id)) {
							if (obj.error) {
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								const errMsg = cleanErrorMessage(obj.error.data || obj.error.message);
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								this.txSubscribes.get(obj.id)!.rejector(new Error(errMsg));
							} else {
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								this.txSubscribes.get(obj.id)!.resolver(obj.result.data.value.TxResult.result);
							}

							this.txSubscribes.delete(obj.id);
						}
					}
				}
			} catch (e) {
				console.log(`Tendermint websocket jsonrpc response is not JSON: ${e.message || e.toString()}`);
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
	 * The handelrs shares the subscription of block.
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
			this.newBlockSubscribes = this.newBlockSubscribes.filter(s => s.handler !== handler);
		};
	}

	protected sendSubscribeBlockRpc(): void {
		if (this.readyState === WsReadyState.OPEN) {
			this.ws.send(
				JSON.stringify({
					jsonrpc: '2.0',
					method: 'subscribe',
					params: { query: "tm.event='NewBlock'" },
					id: 1,
				})
			);
		}
	}

	// Query the tx and subscribe the tx.
	traceTx(query: Uint8Array | Record<string, string | number | boolean>): Promise<any> {
		return new Promise<any>(resolve => {
			// At first, try to query the tx at the same time of subscribing the tx.
			// But, the querying's error will be ignored.
			this.queryTx(query)
				.then(result => {
					if (query instanceof Uint8Array) {
						resolve(result);
						return;
					}

					if (result?.total_count !== '0') {
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

	subscribeTx(query: Uint8Array | Record<string, string | number | boolean>): Promise<any> {
		if (query instanceof Uint8Array) {
			const id = this.createRandomId();

			const params = {
				query: `tm.event='Tx' AND tx.hash='${Buffer.from(query)
					.toString('hex')
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
						.map(key => {
							return {
								key,
								value: query[key],
							};
						})
						.map(obj => {
							return `${obj.key}=${typeof obj.value === 'string' ? `'${obj.value}'` : obj.value}`;
						})
						.join(' and '),
				page: '1',
				per_page: '1',
				order_by: 'desc',
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

	protected sendSubscribeTxRpc(id: number, params: Record<string, string | number | boolean>): void {
		if (this.readyState === WsReadyState.OPEN) {
			this.ws.send(
				JSON.stringify({
					jsonrpc: '2.0',
					method: 'subscribe',
					params: params,
					id,
				})
			);
		}
	}

	queryTx(query: Uint8Array | Record<string, string | number | boolean>): Promise<any> {
		if (query instanceof Uint8Array) {
			return this.query('tx', { hash: Buffer.from(query).toString('base64'), prove: false });
		} else {
			const params = {
				query: Object.keys(query)
					.map(key => {
						return {
							key,
							value: query[key],
						};
					})
					.map(obj => {
						return `${obj.key}=${typeof obj.value === 'string' ? `'${obj.value}'` : obj.value}`;
					})
					.join(' and '),
				page: '1',
				per_page: '1',
				order_by: 'desc',
			};

			return this.query('tx_search', params);
		}
	}

	protected query(method: string, params: Record<string, string | number | boolean>): Promise<any> {
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

	protected sendQueryRpc(id: number, method: string, params: Record<string, string | number | boolean>) {
		if (this.readyState === WsReadyState.OPEN) {
			this.ws.send(
				JSON.stringify({
					jsonrpc: '2.0',
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
				.join('')
		);
	}
}

const sequenceNumberErrorMsgRe = /signature verification failed; please verify account number \([0-9]*\), sequence \(([0-9]*)\) and chain-id \(osmosis-1\): unauthorized/;
const sequenceNumberErrorReplaceMsg =
	"You have too many concurrent txs going on! Try resending after your prior tx lands on chain. (We couldn't send the tx with sequence number $1)";

function cleanErrorMessage(s1: string): string {
	let newErrorMsg = s1.replace(sequenceNumberErrorMsgRe, sequenceNumberErrorReplaceMsg);
	// parsed from assetlists
	// todo: Do a single pass operation in the future
	newErrorMsg = newErrorMsg.replace('ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2', 'atom');
	newErrorMsg = newErrorMsg.replace('ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4', 'akt');
	newErrorMsg = newErrorMsg.replace('ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293', 'xprt');
	newErrorMsg = newErrorMsg.replace('ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0', 'iris');
	newErrorMsg = newErrorMsg.replace('ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84', 'dvpn');
	newErrorMsg = newErrorMsg.replace('ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1', 'cro');
	newErrorMsg = newErrorMsg.replace('ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076', 'regen');
	newErrorMsg = newErrorMsg.replace('ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC', 'iov');
	newErrorMsg = newErrorMsg.replace('ibc/CD942F878C80FBE9DEAB8F8E57F592C7252D06335F193635AF002ACBD69139CC', 'tick');
	return newErrorMsg;
}
