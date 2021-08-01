import { computed, flow, makeObservable, observable, toJS } from 'mobx';
import { KVStore, toGenerator } from '@keplr-wallet/common';
import { TxTracer, WsReadyState } from '../../tx';
import { ChainGetter } from '@keplr-wallet/stores';
import { AppCurrency } from '@keplr-wallet/types';
import { keepAlive } from 'mobx-utils';
import { ChainIdHelper } from '@keplr-wallet/cosmos';

export type IBCTransferHistoryStatus = 'pending' | 'complete' | 'timeout' | 'refunded';

export interface IBCTransferHistory {
	// Hex encoded.
	readonly txHash: string;
	readonly sourceChainId: string;
	readonly sourceChannelId: string;
	readonly destChainId: string;
	readonly destChannelId: string;
	readonly sequence: string;
	readonly sender: string;
	readonly recipient: string;
	readonly amount: {
		currency: AppCurrency;
		amount: string;
	};
	status: IBCTransferHistoryStatus;
	// timeoutHeight should be formed as the `{chain_version}-{block_height}`
	readonly timeoutHeight?: string;
	readonly createdAt: string;
}

export class IBCTransferHistoryStore {
	@observable
	protected _histories: IBCTransferHistory[] = [];

	protected onHistoryChangedHandlers: ((history: IBCTransferHistory) => void)[] = [];

	// Key is chain id.
	// No need to be observable
	protected blockSubscriberMap: Map<string, TxTracer> = new Map();

	constructor(protected readonly kvStore: KVStore, protected readonly chainGetter: ChainGetter) {
		makeObservable(this);

		this.restore();

		keepAlive(this, 'historyMapByTxHash');
	}

	addHistoryChangedHandler(handler: (history: IBCTransferHistory) => void) {
		this.onHistoryChangedHandlers.push(handler);
	}

	get histories(): IBCTransferHistory[] {
		return this._histories;
	}

	protected getBlockSubscriber(chainId: string): TxTracer {
		if (!this.blockSubscriberMap.has(chainId)) {
			this.blockSubscriberMap.set(chainId, new TxTracer(this.chainGetter.getChain(chainId).rpc, '/websocket'));
		}

		return this.blockSubscriberMap.get(chainId)!;
	}

	// timeoutHeight should be formed as the `{chain_version}-{block_height}`
	protected traceTimeoutHeight(
		blockSubscriber: TxTracer,
		timeoutHeight: string
	): {
		unsubscriber: () => void;
		promise: Promise<void>;
	} {
		const chainVersion = parseInt(timeoutHeight.split('-')[0]);
		const timeoutBlockHeight = parseInt(timeoutHeight.split('-')[1]);

		let resolver: (value: PromiseLike<void> | void) => void;
		const promise = new Promise<void>(resolve => {
			resolver = resolve;
		});
		const unsubscriber = blockSubscriber.subscribeBlock(data => {
			const chainId = data?.block?.header?.chain_id;
			if (chainId && ChainIdHelper.parse(chainId).version > chainVersion) {
				resolver();
				return;
			}
			const blockHeight = data?.block?.header?.height;
			if (blockHeight && parseInt(blockHeight) > timeoutBlockHeight) {
				resolver();
				return;
			}
		});

		return {
			unsubscriber,
			promise,
		};
	}

	async traceHistroyStatus(
		history: Pick<
			IBCTransferHistory,
			'sourceChainId' | 'sourceChannelId' | 'destChainId' | 'destChannelId' | 'sequence' | 'timeoutHeight' | 'status'
		>
	): Promise<IBCTransferHistoryStatus> {
		if (history.status === 'complete' || history.status === 'refunded') {
			return history.status;
		}

		if (history.status === 'timeout') {
			// If the packet is timeouted, wait until the packet timeout sent to the source chain.
			const txTracer = new TxTracer(this.chainGetter.getChain(history.sourceChainId).rpc, '/websocket');
			await txTracer.traceTx({
				'timeout_packet.packet_src_channel': history.sourceChannelId,
				'timeout_packet.packet_sequence': history.sequence,
			});

			return 'refunded';
		}

		const blockSubscriber = this.getBlockSubscriber(history.destChainId);
		if (blockSubscriber.readyState === WsReadyState.CLOSED) {
			blockSubscriber.open();
		}

		let timeoutUnsubscriber: (() => void) | undefined;

		const promises: Promise<any>[] = [];

		if (history.timeoutHeight) {
			promises.push(
				(async () => {
					const { promise, unsubscriber } = this.traceTimeoutHeight(blockSubscriber, history.timeoutHeight!);
					timeoutUnsubscriber = unsubscriber;
					await promise;

					// Even though the block is reached to the timeout height,
					// the receiving packet event could be delivered before the block timeout if the network connection is unstable.
					// This it not the chain issue itself, jsut the issue from the frontend, it it impossible to ensure the network status entirely.
					// To reduce this problem, just wait 10 second more even if the block is reached to the timeout height.
					await new Promise(resolve => {
						setTimeout(resolve, 10000);
					});
				})()
			);
		}

		const txTracer = new TxTracer(this.chainGetter.getChain(history.destChainId).rpc, '/websocket');
		promises.push(
			txTracer.traceTx({
				'recv_packet.packet_src_channel': history.sourceChannelId,
				'recv_packet.packet_sequence': history.sequence,
			})
		);

		const result = await Promise.race(promises);

		if (timeoutUnsubscriber) {
			timeoutUnsubscriber();

			if (blockSubscriber.numberOfSubscriberOrPendingQuery === 0) {
				blockSubscriber.close();
			}
		}
		txTracer.close();

		// If the TxTracer finds the packet received tx before the timeout height, the raced promise would return the tx itself.
		// But, if the timeout is faster than the packet received, the raced promise would return undefined because the `traceTimeoutHeight` method returns nothing.
		if (result) {
			return 'complete';
		}

		return 'timeout';
	}

	@flow
	*pushPendingHistory(history: Omit<IBCTransferHistory, 'createdAt' | 'status'>) {
		this._histories.push({
			...history,
			status: 'pending',
			createdAt: new Date().toString(),
		});

		yield this.save();

		// Don't need to await (yield)
		this.tryUpdateHistoryStatus(history.txHash);
	}

	@flow
	*tryUpdateHistoryStatus(txHash: string) {
		if (!this.historyMapByTxHash.has(txHash)) {
			return;
		}

		const history = this.historyMapByTxHash.get(txHash)!;
		const status = yield* toGenerator(this.traceHistroyStatus(history));
		if (history.status !== status) {
			history.status = status;

			for (const handler of this.onHistoryChangedHandlers) {
				handler(history);
			}

			yield this.save();

			if (history.status === 'timeout') {
				// If the transfer packet is timeouted, try to wait the refunded.
				this.tryUpdateHistoryStatus(txHash);
			}
		}
	}

	@computed
	protected get historyMapByTxHash(): Map<string, IBCTransferHistory> {
		const map: Map<string, IBCTransferHistory> = new Map();

		for (const history of this._histories) {
			map.set(history.txHash, history);
		}

		return map;
	}

	@flow
	protected *restore() {
		const saved = yield* toGenerator(this.kvStore.get<IBCTransferHistory[]>(this.key()));
		if (saved) {
			this._histories = saved;

			for (const history of this._histories) {
				// Don't need to await (yield) this loop.
				this.tryUpdateHistoryStatus(history.txHash);
			}
		} else {
			this._histories = [];
		}
	}

	protected async save() {
		await this.kvStore.set(this.key(), toJS(this._histories));
	}

	protected key(): string {
		return 'histories';
	}
}
