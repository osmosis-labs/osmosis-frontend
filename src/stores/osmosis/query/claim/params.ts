import { ObservableChainQuery } from '@keplr-wallet/stores/build/query/chain-query';
import { ClaimParams } from './types';
import { KVStore } from '@keplr-wallet/common';
import { ChainGetter } from '@keplr-wallet/stores/src/common/index';
import { computed, makeObservable } from 'mobx';
import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { Currency } from '@keplr-wallet/types';

export class ObservableQueryClaimParams extends ObservableChainQuery<ClaimParams> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter, `/osmosis/claim/v1beta1/params`);

		makeObservable(this);
	}

	@computed
	get airdropStartTime(): Date {
		if (!this.response) {
			return new Date(0);
		}

		return new Date(this.response.data.params.airdrop_start_time);
	}

	@computed
	get timeUntilDecay(): Date {
		const airdropStartTime = dayjs(this.airdropStartTime);
		return airdropStartTime.add(this.durationUntilDecay).toDate();
	}

	@computed
	get durationUntilDecay(): Duration {
		if (!this.response) {
			return dayjs.duration(0);
		}

		return dayjs.duration(parseInt(this.response.data.params.duration_until_decay.replace('s', '')) * 1000);
	}

	@computed
	get durationOfDecay(): Duration {
		if (!this.response) {
			return dayjs.duration(0);
		}

		return dayjs.duration(parseInt(this.response.data.params.duration_of_decay.replace('s', '')) * 1000);
	}
}
