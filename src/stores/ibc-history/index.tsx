import { computed, flow, makeObservable, observable, toJS } from 'mobx';
import { KVStore, toGenerator } from '@keplr-wallet/common';
import { TxTracer } from '../../tx';
import { ChainGetter } from '@keplr-wallet/stores';
import { AppCurrency } from '@keplr-wallet/types';
import { computedFn, keepAlive } from 'mobx-utils';
import { ChainIdHelper } from '@keplr-wallet/cosmos';
import { Buffer } from 'buffer/';
import dayjs from 'dayjs';
import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface UncommitedHistory {
	// Hex encoded.
	readonly txHash: string;
	readonly sourceChainId: string;
	readonly destChainId: string;
	readonly recipient: string;
	readonly amount: {
		currency: AppCurrency;
		amount: string;
	};
	readonly sender: string;
	readonly createdAt: string;
}

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
	readonly timeoutTimestamp?: string;
	readonly createdAt: string;
}

export class PollingStatusSubscription {
	protected readonly rpcInstance: AxiosInstance;

	protected _subscriptionCount: number = 0;

	protected _handlers: ((data: any) => void)[] = [];

	constructor(protected readonly rpc: string, protected readonly rpcConfig?: AxiosRequestConfig) {
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
			this._handlers = this._handlers.filter(h => h !== handler);
			this.decreaseSubscriptionCount();
		};
	}

	protected async startSubscription() {
		while (this._subscriptionCount > 0) {
			await new Promise(resolve => {
				// 7.5 sec.
				setTimeout(resolve, 7500);
			});

			try {
				const response = await this.rpcInstance.get('/status');
				if (response.status === 200) {
					this._handlers.forEach(handler => handler(response.data));
				}
			} catch (e) {
				console.log(`Failed to fetch /status: ${e?.toString()}`);
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

export class IBCTransferHistoryStore {
	/*
	 * The tx takes more time to be commited after the tx broadcasted.
	 * So, users could exit the site after tx broadcasting but before the tx actually commited.
	 * Because this store manages tx history locally, it is not enough to assume that the users should wait to tx committed.
	 * So, when the tx broadcasted, save these pending(will committed expectedly) txs seperately.
	 * This umcommited history would be added `onBroadcasted` event, and it can be replaced with actual `IBCTransferHistory` on `onFulfill` event, if the user waits the tx commited.
	 * So, it will not track the tx when it is added.
	 * Alternatively, when restoring this store (user enters this site), try to track the tx by the tx hash, and replace to the `IBCTransferHistory` if the tx committed.
	 */
	@observable.shallow
	protected _uncommitedHistories: UncommitedHistory[] = [];

	@observable
	protected _histories: IBCTransferHistory[] = [];

	protected onHistoryChangedHandlers: ((history: IBCTransferHistory) => void)[] = [];

	// Key is chain id.
	// No need to be observable
	protected blockSubscriberMap: Map<string, PollingStatusSubscription> = new Map();

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

	getHistoriesByAccount = computedFn((address: string): IBCTransferHistory[] => {
		return this.histories
			.filter(history => history.sender === address || history.recipient === address)
			.sort((history1, history2) => {
				// Sort by created time.
				return new Date(history1.createdAt) > new Date(history2.createdAt) ? -1 : 1;
			});
	});

	getUncommitedHistoriesByAccount = computedFn((address: string): UncommitedHistory[] => {
		return this._uncommitedHistories
			.filter(history => history.sender === address || history.recipient === address)
			.sort((history1, history2) => {
				// Sort by created time.
				return new Date(history1.createdAt) > new Date(history2.createdAt) ? -1 : 1;
			});
	});

	getHistoriesAndUncommitedHistoriesByAccount = computedFn((address: string): (
		| IBCTransferHistory
		| UncommitedHistory
	)[] => {
		return this._uncommitedHistories
			.concat(this.histories)
			.filter(history => history.sender === address || history.recipient === address)
			.sort((history1, history2) => {
				// Sort by created time.
				return new Date(history1.createdAt) > new Date(history2.createdAt) ? -1 : 1;
			});
	});

	protected getBlockSubscriber(chainId: string): PollingStatusSubscription {
		if (!this.blockSubscriberMap.has(chainId)) {
			const chainInfo = this.chainGetter.getChain(chainId);
			this.blockSubscriberMap.set(chainId, new PollingStatusSubscription(chainInfo.rpc, chainInfo.rpcConfig));
		}

		return this.blockSubscriberMap.get(chainId)!;
	}

	// timeoutHeight should be formed as the `{chain_version}-{block_height}`
	protected traceTimeoutHeight(
		statusSubscriber: PollingStatusSubscription,
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
		const unsubscriber = statusSubscriber.subscribe(data => {
			const chainId = data?.result?.node_info?.network;
			if (chainId && ChainIdHelper.parse(chainId).version > chainVersion) {
				resolver();
				return;
			}
			const blockHeight = data?.result?.sync_info?.latest_block_height;
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

	protected traceTimeoutTimestamp(
		statusSubscriber: PollingStatusSubscription,
		timeoutTimestamp: string
	): {
		unsubscriber: () => void;
		promise: Promise<void>;
	} {
		let resolver: (value: PromiseLike<void> | void) => void;
		const promise = new Promise<void>(resolve => {
			resolver = resolve;
		});
		const unsubscriber = statusSubscriber.subscribe(data => {
			const blockTime = data?.result?.sync_info?.latest_block_time;
			if (blockTime && new Date(blockTime).getTime() > Math.floor(parseInt(timeoutTimestamp) / 1000000)) {
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
			| 'sourceChainId'
			| 'sourceChannelId'
			| 'destChainId'
			| 'destChannelId'
			| 'sequence'
			| 'timeoutHeight'
			| 'timeoutTimestamp'
			| 'status'
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

			txTracer.close();
			return 'refunded';
		}

		const blockSubscriber = this.getBlockSubscriber(history.destChainId);

		let timeoutUnsubscriber: (() => void) | undefined;

		const promises: Promise<any>[] = [];

		if (history.timeoutHeight && !history.timeoutHeight.endsWith('-0')) {
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
		} else if (history.timeoutTimestamp && history.timeoutTimestamp !== '0') {
			promises.push(
				(async () => {
					const { promise, unsubscriber } = this.traceTimeoutTimestamp(blockSubscriber, history.timeoutTimestamp!);
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
				// Should use the dst channel. B
				// Because src channel is agnostic to the counterparty chain's channel sequence,
				// it can be duplicated on the counterparty chain.
				'recv_packet.packet_dst_channel': history.destChannelId,
				'recv_packet.packet_sequence': history.sequence,
			})
		);

		const result = await Promise.race(promises);

		if (timeoutUnsubscriber) {
			timeoutUnsubscriber();
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
	*pushUncommitedHistore(history: Omit<UncommitedHistory, 'createdAt'>) {
		this._uncommitedHistories.push({
			...history,
			createdAt: new Date().toString(),
		});

		yield this.save();
	}

	@flow
	*pushPendingHistory(history: Omit<IBCTransferHistory, 'createdAt' | 'status'>) {
		this._uncommitedHistories = this._uncommitedHistories.filter(uncommited => uncommited.txHash !== history.txHash);

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
	protected *pushPendingHistoryWithCreatedAt(history: Omit<IBCTransferHistory, 'status'>) {
		this._uncommitedHistories = this._uncommitedHistories.filter(uncommited => uncommited.txHash !== history.txHash);

		this._histories.push({
			...history,
			status: 'pending',
		});

		yield this.save();

		// Don't need to await (yield)
		this.tryUpdateHistoryStatus(history.txHash);
	}

	@flow
	protected *traceUncommitedHistoryAndUpgradeToPendingHistory(txHash: string) {
		const uncommited = this._uncommitedHistories.find(uncommited => uncommited.txHash === txHash);
		if (uncommited) {
			const txTracer = new TxTracer(this.chainGetter.getChain(uncommited.sourceChainId).rpc, '/websocket');
			const result = yield* toGenerator(txTracer.traceTx(Buffer.from(uncommited.txHash, 'hex')));
			txTracer.close();

			const tx = result?.tx_result ?? result;

			const events = tx?.events as { type: string; attributes: { key: string; value: string }[] }[] | undefined;
			if (tx && !tx.code && events) {
				if (events) {
					for (const event of events) {
						if (event.type === 'send_packet') {
							const attributes = event.attributes;
							const sourceChannelAttr = attributes.find(
								attr => attr.key === Buffer.from('packet_src_channel').toString('base64')
							);
							const sourceChannel = sourceChannelAttr
								? Buffer.from(sourceChannelAttr.value, 'base64').toString()
								: undefined;
							const destChannelAttr = attributes.find(
								attr => attr.key === Buffer.from('packet_dst_channel').toString('base64')
							);
							const destChannel = destChannelAttr ? Buffer.from(destChannelAttr.value, 'base64').toString() : undefined;
							const sequenceAttr = attributes.find(
								attr => attr.key === Buffer.from('packet_sequence').toString('base64')
							);
							const sequence = sequenceAttr ? Buffer.from(sequenceAttr.value, 'base64').toString() : undefined;
							const timeoutHeightAttr = attributes.find(
								attr => attr.key === Buffer.from('packet_timeout_height').toString('base64')
							);
							const timeoutHeight = timeoutHeightAttr
								? Buffer.from(timeoutHeightAttr.value, 'base64').toString()
								: undefined;
							const timeoutTimestampAttr = attributes.find(
								attr => attr.key === Buffer.from('packet_timeout_timestamp').toString('base64')
							);
							const timeoutTimestamp = timeoutTimestampAttr
								? Buffer.from(timeoutTimestampAttr.value, 'base64').toString()
								: undefined;

							if (sourceChannel && destChannel && sequence) {
								this.pushPendingHistoryWithCreatedAt({
									txHash: uncommited.txHash,
									sourceChainId: uncommited.sourceChainId,
									sourceChannelId: sourceChannel,
									destChainId: uncommited.destChainId,
									destChannelId: destChannel,
									sequence,
									sender: uncommited.sender,
									recipient: uncommited.recipient,
									amount: uncommited.amount,
									timeoutHeight,
									timeoutTimestamp,
									createdAt: uncommited.createdAt,
								});
							}
						}
					}
				}
			}

			// This method could be executed several at the same time,
			// So you should find the index right before removing.
			const index = this._uncommitedHistories.findIndex(uncommited => uncommited.txHash === txHash);
			this._uncommitedHistories.splice(index, 1);
			yield this.save();
		}
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
		const uncommitedHistories = yield* toGenerator(this.kvStore.get<UncommitedHistory[]>('uncommited_histories'));
		if (uncommitedHistories) {
			this._uncommitedHistories = uncommitedHistories;

			for (const uncommited of this._uncommitedHistories) {
				// Don't need to await (yield) this loop.
				this.traceUncommitedHistoryAndUpgradeToPendingHistory(uncommited.txHash);
			}
		} else {
			this._uncommitedHistories = [];
		}

		const histories = yield* toGenerator(this.kvStore.get<IBCTransferHistory[]>('histories'));
		if (histories) {
			this._histories = histories;

			for (const history of this._histories) {
				// Don't need to await (yield) this loop.
				this.tryUpdateHistoryStatus(history.txHash);
			}
		} else {
			this._histories = [];
		}

		yield this.trimObsoleteHistory();
	}

	@flow
	protected *trimObsoleteHistory() {
		// Only manages the histories less than 3 days old
		const beforeUncommitedLength = this._uncommitedHistories.length;
		this._uncommitedHistories = this._uncommitedHistories.filter(uncommited =>
			dayjs(new Date(uncommited.createdAt))
				.add(
					dayjs.duration({
						days: 3,
					})
				)
				.isAfter(new Date())
		);

		const beforeLength = this._histories.length;
		this._histories = this._histories.filter(uncommited =>
			dayjs(new Date(uncommited.createdAt))
				.add(
					dayjs.duration({
						days: 3,
					})
				)
				.isAfter(new Date())
		);

		if (this._uncommitedHistories.length !== beforeUncommitedLength || this._histories.length !== beforeLength) {
			yield this.save();
		}
	}

	protected async save() {
		await this.kvStore.set('histories', toJS(this._histories));
		await this.kvStore.set('uncommited_histories', toJS(this._uncommitedHistories));
	}
}
