import { ChainGetter } from '@keplr-wallet/stores';
import { ObservableQuerySuperfluidParams } from 'src/stores/osmosis/query/superfluid-pools/params';
import { ObservableQuerySuperfluidAssetMultiplier } from 'src/stores/osmosis/query/superfluid-pools/asset-multiplier';
import { computedFn } from 'mobx-utils';
import { CoinPretty, Dec, DecUtils } from '@keplr-wallet/unit';

export class ObservableQuerySuperfluidOsmoEquivalent {
	constructor(
		protected readonly chainId: string,
		protected readonly chainGetter: ChainGetter,
		protected readonly _querySuperfluidParams: ObservableQuerySuperfluidParams,
		protected readonly _querySuperfluidAssetMultiplier: ObservableQuerySuperfluidAssetMultiplier
	) {}

	readonly calculateOsmoEquivalent = computedFn(
		(coinPretty: CoinPretty): CoinPretty => {
			return this.calculateOsmoEquivalentInner(
				coinPretty
					.toDec()
					.mul(DecUtils.getTenExponentN(coinPretty.currency.coinDecimals))
					.toString(),
				coinPretty.currency.coinMinimalDenom
			);
		}
	);

	protected readonly calculateOsmoEquivalentInner = computedFn(
		(amountRaw: string, denom: string): CoinPretty => {
			const amountDec = new Dec(amountRaw);

			const multiplier = this.calculateOsmoEquivalentMultiplier(denom);

			const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

			return new CoinPretty(stakeCurrency, amountDec.mul(multiplier));
		}
	);

	readonly calculateOsmoEquivalentMultiplier = computedFn(
		(denom: string): Dec => {
			const minimumRiskFactor = this._querySuperfluidParams.minimumRiskFactor;
			const assetMultiplier = this._querySuperfluidAssetMultiplier.getDenom(denom).multiplier;

			return assetMultiplier.mul(new Dec(1).sub(minimumRiskFactor));
		}
	);
}
