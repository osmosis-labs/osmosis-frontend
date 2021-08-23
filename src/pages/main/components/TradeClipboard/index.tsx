import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { ButtonHTMLAttributes, FunctionComponent, useEffect } from 'react';
import { Img } from 'src/components/common/Img';
import { FeesBox } from 'src/components/SwapToken/FeesBox';
import { FromBox } from 'src/components/SwapToken/FromBox';
import { ToBox } from 'src/components/SwapToken/ToBox';
import { colorPrimary, colorPrimaryLight } from 'src/emotionStyles/colors';
import { cssRaiseButtonShadow } from 'src/emotionStyles/forms';
import { cssAbsoluteCenter } from 'src/emotionStyles/layout';
import { useFakeFeeConfig } from 'src/hooks/tx';
import { Clip } from 'src/pages/main/components/TradeClipboard/Clip';
import { useStore } from 'src/stores';
import { useTradeConfig } from '../../hooks/useTradeConfig';
import { SwapButton } from '../SwapButton';
import { TradeTxSettings } from './TradeTxSettings';

export const TradeClipboard: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, accountStore, swapManager } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const config = useTradeConfig(
		chainStore,
		chainStore.current.chainId,
		account.bech32Address,
		queries.queryBalances,
		swapManager,
		queries.osmosis.queryGammPools
	);
	const feeConfig = useFakeFeeConfig(
		chainStore,
		chainStore.current.chainId,
		account.msgOpts.swapExactAmountIn.gas * Math.max(config.poolIds.length, 1)
	);
	config.setFeeConfig(feeConfig);

	useEffect(() => {
		for (const currency of config.sendableCurrencies) {
			// Try to get the information of all sendable currencies.
			// The currency in the token list of selector is not registered to the chain store
			// even if the currency is unknown.
			// Next line ensures that the all sendable currency would be registered to the chain store if the currnecy is unknown.
			chainStore.getChain(chainStore.current.chainId).findCurrency(currency.coinMinimalDenom);
		}
	}, [chainStore.current, config.sendableCurrencies]);

	return (
		<TradeClipboardContainer>
			<Clip />
			<TradeClipboardContent>
				<TradeTxSettings config={config} />

				<TradeAmountSection>
					<FromBox
						config={config}
						style={{ marginBottom: 18 }}
						dropdownStyle={{ marginLeft: -16, width: 420 + 16 + 20 }}
					/>
					<SwitchInOutButton type="button" onClick={() => config.switchInAndOut()} />
					<ToBox
						config={config}
						style={{ marginBottom: 18 }}
						dropdownStyle={{ marginLeft: -16, width: 420 + 16 + 20 }}
					/>
				</TradeAmountSection>

				<FeesBox style={{ marginBottom: 50 }} config={config} />

				<SwapButton config={config} />
			</TradeClipboardContent>
		</TradeClipboardContainer>
	);
});

const TradeClipboardContainer = styled.div`
	width: 100%;
	height: 100%;
	padding: 10px;
	border-radius: 1rem;
	position: relative;
	border: 2px solid ${colorPrimaryLight};
	${cssRaiseButtonShadow};
	background-color: ${colorPrimary};
`;

const TradeClipboardContent = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	background-color: ${colorPrimaryLight};
	border-radius: 0.375rem;
	padding: 20px;
	z-index: 0;
`;

const TradeAmountSection = styled.section`
	width: 100%;
	margin-top: 20px;
	position: relative;
`;

function SwitchInOutButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<SwitchInOutButtonContainer {...props}>
			<Img style={{ width: '3rem', height: '3rem' }} src="/public/assets/sidebar/icon-border_unselected.svg" />
			<SwitchIcon src="/public/assets/Icons/Switch.svg" />
		</SwitchInOutButtonContainer>
	);
}

const SwitchInOutButtonContainer = styled.button`
	${cssAbsoluteCenter};
	width: 3rem;
	height: 3rem;
	z-index: 1;
`;

const SwitchIcon = styled(Img)`
	${cssAbsoluteCenter};
	width: 1.6rem;
	height: 1.6rem;
`;
