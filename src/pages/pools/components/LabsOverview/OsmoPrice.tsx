import { CoinPretty, DecUtils } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { OverviewLabelValue } from 'src/components/common/OverviewLabelValue';
import { useStore } from 'src/stores';

export const OsmoPrice = observer(function OsmoPrice() {
	const { chainStore, priceStore } = useStore();

	const price = priceStore.calculatePrice(
		'usd',
		new CoinPretty(
			chainStore.current.stakeCurrency,
			DecUtils.getPrecisionDec(chainStore.current.stakeCurrency.coinDecimals)
		)
	);

	return (
		<OverviewLabelValue label="OSMO Price">
			<h4>{price ? price.toString() : '$0'}</h4>
		</OverviewLabelValue>
	);
});
