import { ObservableChainQuery } from '@keplr-wallet/stores/build/query/chain-query';
import { KVStore } from '@keplr-wallet/common';
import { ChainGetter } from '@keplr-wallet/stores/src/common/index';
import { Epochs } from './types';
import { computed, observable } from 'mobx';
import dayjs from 'dayjs';

export class ObservableQueryEpochsInner {
	constructor(protected readonly identifier: string, protected readonly queryEpochs: ObservableQueryEpochs) {}

	@computed
	get epoch(): Epochs['epochs'][0] | undefined {
		return this.queryEpochs.response?.data.epochs.find(epoch => epoch.identifier === this.identifier);
	}

	@computed
	get startTime(): Date {
		if (!this.epoch) {
			return new Date(0);
		}

		return new Date(this.epoch.start_time);
	}

	@computed
	get endTime(): Date {
		const startTime = this.startTime;
		if (!this.epoch?.duration) {
			return startTime;
		}

		// Golang Protobuf의 duration은 초단위로만 반환된다.
		// XXX: commonjs일때 밑의 라인이 오류가 발생해서 test:rand-pools 스크립트가 실행이 안됨...
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const duration = dayjs.duration({
			seconds: parseInt(this.epoch.duration.replace('s', '')),
		});

		return dayjs(startTime)
			.add(duration)
			.toDate();
	}
}

export class ObservableQueryEpochs extends ObservableChainQuery<Epochs> {
	@observable.shallow
	protected map: Map<string, ObservableQueryEpochsInner> = new Map();

	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter, '/osmosis/epochs/v1beta1/epochs');
	}

	getEpoch(identifier: string) {
		if (!this.map.has(identifier)) {
			const inner = new ObservableQueryEpochsInner(identifier, this);
			this.map.set(identifier, inner);
		}

		return this.map.get(identifier)!;
	}
}
