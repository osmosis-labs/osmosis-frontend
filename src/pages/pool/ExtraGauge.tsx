import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { AppCurrency } from '@keplr-wallet/types';
import { useStore } from '../../stores';
import dayjs from 'dayjs';

export const ExtraGauge: FunctionComponent<{
	gaugeId: string;
	currency: AppCurrency;
}> = observer(({ gaugeId, currency }) => {
	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);

	const gauge = queries.osmosis.queryGauge.get(gaugeId);

	return (
		<React.Fragment>
			{gauge.response ? (
				<div className="bg-card rounded-2xl pt-7 px-7.5 pb-10 mt-10 border border-white-mid">
					<h4 className="mb-4 font-normal text-xl xl:text-2xl">Bonus bonding reward</h4>
					<p className="mb-4">
						This pool bonding over {gauge.lockupDuration.humanize()} will earn additional bonding
						<br />
						incentives for {gauge.numEpochsPaidOver} epochs starting at {dayjs(gauge.startTime).format('MMM D, YYYY')}.
					</p>
					<h6 className="text-secondary-200 font-normal">{`Total Bonus: ${gauge
						.getCoin(currency)
						.maxDecimals(6)
						.trim(true)
						.toString()}`}</h6>
				</div>
			) : null}
		</React.Fragment>
	);
});
