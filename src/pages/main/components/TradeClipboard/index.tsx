import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { ButtonHTMLAttributes, FunctionComponent, useEffect } from 'react';
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
import useWindowSize from 'src/hooks/useWindowSize';
import { WalletStatus } from '@keplr-wallet/stores';
import { useTradeUrlQueryParams } from 'src/pages/main/hooks/useTradeUrlQueryParams';
import { useHistory } from 'react-router-dom';

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

	useTradeUrlQueryParams(config);

	const { isMobileView } = useWindowSize();

	useEffect(() => {
		for (const currency of config.sendableCurrencies) {
			// Try to get the information of all sendable currencies.
			// The currency in the token list of selector is not registered to the chain store
			// even if the currency is unknown.
			// Next line ensures that the all sendable currency would be registered to the chain store if the currnecy is unknown.
			chainStore.getChain(chainStore.current.chainId).findCurrency(currency.coinMinimalDenom);
		}
	}, [chainStore.current, config.sendableCurrencies]);

	const history = useHistory();

	return (
		<React.Fragment>
			<img
				src={require('../../../../../public/assets/terra-banner.png').default}
				alt={'Terra added'}
				className="cursor-pointer"
				style={{
					width: '100%',
					maxWidth: '519.453px',
					borderRadius: '8px',
				}}
				onClick={e => {
					e.preventDefault();

					const terraCccount = accountStore.getAccount('columbus');
					if (terraCccount.walletStatus === WalletStatus.NotInit) {
						terraCccount.init();
					}

					history.push('/assets?terra=true');
				}}
			/>
			<TradeClipboardContainer>
				<Clip />
				<TradeClipboardContent style={isMobileView ? { maxHeight: '524px' } : undefined}>
					<TradeTxSettings config={config} />

					<TradeAmountSection>
						<FromBox config={config} style={{ marginBottom: isMobileView ? 14 : 18 }} />
						<SwitchInOutButton type="button" onClick={() => config.switchInAndOut()} />
						<ToBox config={config} style={{ marginBottom: isMobileView ? 14 : 18 }} />
					</TradeAmountSection>

					<FeesBox config={config} />

					<div style={{ flex: 1 }} />

					<SwapButton config={config} />
				</TradeClipboardContent>
			</TradeClipboardContainer>
		</React.Fragment>
	);
});

const TradeClipboardContainer = styled.div`
	width: 100%;
	height: 100%;
	margin-top: 20px;
	border-radius: 1rem;
	position: relative;

	@media (min-width: 768px) {
		padding: 10px;
		border: 2px solid ${colorPrimaryLight};
		${cssRaiseButtonShadow};
		background-color: ${colorPrimary};
	}
`;

const TradeClipboardContent = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	background-color: ${colorPrimaryLight};
	border-radius: 0.375rem;
	z-index: 0;
	padding: 10px 10px 14px;

	display: flex;
	flex-direction: column;

	@media (min-width: 768px) {
		padding: 20px 20px 30px;
	}
`;

const TradeAmountSection = styled.section`
	width: 100%;
	margin-top: 12px;
	position: relative;

	@media (min-width: 768px) {
		margin-top: 20px;
	}
`;

function SwitchInOutButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<SwitchInOutButtonContainer {...props}>
			<img
				alt="switch-in-out"
				style={{ width: '3rem', height: '3rem' }}
				src="/public/assets/sidebar/icon-border_unselected.svg"
			/>
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

const SwitchIcon = styled.img`
	${cssAbsoluteCenter};
	width: 1.6rem;
	height: 1.6rem;
`;
