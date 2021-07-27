import { flow, observable } from 'mobx';
import { KVStore, toGenerator } from '@keplr-wallet/common';
import { TxTracer } from '../../tx';
import { ChainGetter } from '@keplr-wallet/stores';
import { Dec } from '@keplr-wallet/unit';
import { AppCurrency } from '@keplr-wallet/types';

export type IBCTransferHistoryStatus = 'pending' | 'complete' | 'timeout' | 'refunded';

export interface IBCTransferHistory {
	readonly sourceChainId: string;
	readonly sourceChannelId: string;
	readonly destChainId: string;
	readonly destChannelId: string;
	readonly sequence: string;
	readonly sender: string;
	readonly amount: {
		currency: AppCurrency;
		amount: string;
	};
	readonly status: IBCTransferHistoryStatus;
	readonly createdAt: string;
}

export class IBCTransferHistoryStore {
	@observable.shallow
	protected _histories: IBCTransferHistory[] = [];

	constructor(protected readonly kvStore: KVStore, protected readonly chainGetter: ChainGetter) {
		this.restore();
	}

	get history(): IBCTransferHistory[] {
		return this._histories;
	}

	async traceHistroy(
		history: Pick<
			IBCTransferHistory,
			'sourceChainId' | 'sourceChannelId' | 'destChainId' | 'destChannelId' | 'sequence'
		>
	) {
		const txTracer = new TxTracer(this.chainGetter.getChain(history.destChainId).rpc, '/websocket');
		const tx = await txTracer.traceTx({
			'recv_packet.packet_src_channel': history.sourceChannelId,
			'recv_packet.packet_sequence': history.sequence,
		});
		txTracer.close();

		console.log(tx);
	}

	@flow
	*pushPendingHistory(history: Omit<IBCTransferHistory, 'createdAt' | 'status'>) {
		this._histories.push({
			...history,
			status: 'pending',
			createdAt: new Date().toString(),
		});

		yield this.save();
	}

	@flow
	protected *restore() {
		const saved = yield* toGenerator(this.kvStore.get(this.key()));
		if (saved) {
			this._histories = saved as IBCTransferHistory[];
		} else {
			this._histories = [];
		}
	}

	protected async save() {
		await this.kvStore.set(this.key(), this._histories);
	}

	protected key(): string {
		return 'histories';
	}
}
