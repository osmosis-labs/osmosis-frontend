import { computed, flow, makeObservable, observable, toJS } from 'mobx';
import { KVStore, toGenerator } from '@keplr-wallet/common';
import { TxTracer } from '../../tx';
import { ChainGetter } from '@keplr-wallet/stores';
import { AppCurrency } from '@keplr-wallet/types';
import { keepAlive } from 'mobx-utils';

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

	async traceHistroyStatus(
		history: Pick<
			IBCTransferHistory,
			'sourceChainId' | 'sourceChannelId' | 'destChainId' | 'destChannelId' | 'sequence' | 'status'
		>
	): Promise<IBCTransferHistoryStatus> {
		if (history.status === 'complete' || history.status === 'refunded') {
			return history.status;
		}

		const blockSubscriber = this.getBlockSubscriber(history.destChainId);

		const txTracer = new TxTracer(this.chainGetter.getChain(history.destChainId).rpc, '/websocket');
		const tx = await txTracer.traceTx({
			'recv_packet.packet_src_channel': history.sourceChannelId,
			'recv_packet.packet_sequence': history.sequence,
		});
		txTracer.close();

		return 'complete';
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
