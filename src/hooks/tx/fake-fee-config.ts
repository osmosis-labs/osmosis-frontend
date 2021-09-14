import { DefaultGasPriceStep, FeeType, IFeeConfig, TxChainSetter } from '@keplr-wallet/hooks';
import { ChainGetter, CoinPrimitive } from '@keplr-wallet/stores';
import { CoinPretty, Dec, Int } from '@keplr-wallet/unit';
import { StdFee } from '@cosmjs/launchpad';
import { Currency } from '@keplr-wallet/types';
import { action, computed, makeObservable, observable } from 'mobx';
import { useState } from 'react';
import { computedFn } from 'mobx-utils';

/**
 * FakeFeeConfig is used to set the fee with the high gas price step.
 * Currently, Keplr wallet doesn't support to set the fee manually in the frontend.
 * Keplr wallet just override the fee always in the wallet side.
 * So, setting the exact max amount is not possible.
 * To mitigate this problem, just set the max amount minus high fee setting.
 */
export class FakeFeeConfig extends TxChainSetter implements IFeeConfig {
	@observable
	protected _gas: number;

	constructor(chainGetter: ChainGetter, initialChainId: string, gas: number) {
		super(chainGetter, initialChainId);

		this._gas = gas;

		makeObservable(this);
	}

	get gas(): number {
		return this._gas;
	}

	@action
	setGas(gas: number): void {
		this._gas = gas;
	}

	@computed
	get fee(): CoinPretty | undefined {
		return new CoinPretty(this.feeCurrency!, new Int(this.getFeePrimitive()!.amount));
	}

	get feeCurrencies(): Currency[] {
		return [this.feeCurrency!];
	}

	get feeCurrency(): Currency | undefined {
		const chainInfo = this.chainGetter.getChain(this.chainId);
		return chainInfo.feeCurrencies[0];
	}

	feeType: FeeType | undefined;

	getError(): Error | undefined {
		// noop
		return undefined;
	}

	readonly getFeePrimitive = computedFn((): CoinPrimitive | undefined => {
		const gasPriceStep = this.chainInfo.gasPriceStep ?? DefaultGasPriceStep;
		const feeAmount = new Dec(gasPriceStep.high.toString()).mul(new Dec(this.gas));

		console.log(this.feeCurrency!.coinMinimalDenom, feeAmount.truncate().toString());

		return {
			denom: this.feeCurrency!.coinMinimalDenom,
			amount: feeAmount.truncate().toString(),
		};
	});

	getFeeTypePretty(feeType: FeeType): CoinPretty {
		// noop
		return new CoinPretty(this.feeCurrency!, new Dec(0));
	}

	setFeeType(feeType: FeeType | undefined): void {
		// noop
	}

	toStdFee(): StdFee {
		return {
			gas: this.gas.toString(),
			amount: [this.getFeePrimitive()!],
		};
	}

	isManual: boolean = false;
}

export const useFakeFeeConfig = (chainGetter: ChainGetter, chainId: string, gas: number) => {
	const [config] = useState(() => new FakeFeeConfig(chainGetter, chainId, gas));
	config.setChain(chainId);
	config.setGas(gas);

	return config;
};
