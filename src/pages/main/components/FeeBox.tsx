import { Dec, IntPretty } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Container } from '../../../components/containers';
import { TCardTypes } from '../../../interfaces';
import { TradeConfig } from '../stores/trade/config';

interface Props {
	config: TradeConfig;
}

export const FeesBox = observer(({ config }: Props) => {
	const outSpotPrice = config.spotPriceWithoutSwapFee;
	const inSpotPrice = outSpotPrice.toDec().equals(new Dec(0))
		? outSpotPrice
		: new IntPretty(new Dec(1).quo(outSpotPrice.toDec()));

	return (
		<Container className="rounded-lg py-3 px-4.5 w-full border border-white-faint" type={TCardTypes.CARD}>
			<section className="w-full">
				<div className="flex justify-between items-center">
					<p className="text-sm text-wireframes-lightGrey">Rate</p>
					<p className="text-sm text-wireframes-lightGrey">
						<span className="mr-2">1 {config.sendCurrency.coinDenom.toUpperCase()} =</span>{' '}
						{inSpotPrice
							.maxDecimals(3)
							.trim(true)
							.toString()}{' '}
						{config.outCurrency.coinDenom.toUpperCase()}
					</p>
				</div>
				<div className="flex justify-end items-center mt-1.5 mb-2.5">
					<p className="text-xs text-wireframes-grey">
						<span className="mr-2">1 {config.outCurrency.coinDenom.toUpperCase()} =</span>{' '}
						{outSpotPrice
							.maxDecimals(3)
							.trim(true)
							.toString()}{' '}
						{config.sendCurrency.coinDenom.toUpperCase()}
					</p>
				</div>
				<div className="grid grid-cols-5">
					<p className="text-sm text-wireframes-lightGrey">Swap Fee</p>
					<p className="col-span-4 text-sm text-wireframes-lightGrey text-right truncate">
						{config.swapFees
							.map(swapFee => {
								return (
									swapFee
										.trim(true)
										.maxDecimals(3)
										.toString() + '%'
								);
							})
							.join(' + ')}
					</p>
				</div>
			</section>
		</Container>
	);
});
