import styled from '@emotion/styled';
import { AppCurrency, Currency, IBCCurrency } from '@keplr-wallet/types';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Img } from 'src/components/common/Img';
import { ButtonFaint } from 'src/components/layouts/Buttons';
import { Text, TitleText } from 'src/components/Texts';
import { IBCAssetInfos } from 'src/config';
import { TransferDialog } from 'src/dialogs/Transfer';
import { colorPrimary, colorWhiteRegular } from 'src/emotionStyles/colors';
import { useStore } from 'src/stores';
import { makeIBCMinimalDenom } from 'src/utils/ibc';

const tableWidths = ['50%', '25%', '12.5%', '12.5%'];

export const AssetBalancesList = observer(function AssetBalancesList() {
	const { chainStore, queriesStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const ibcBalances = IBCAssetInfos.map(channelInfo => {
		const chainInfo = chainStore.getChain(channelInfo.counterpartyChainId);
		const ibcDenom = makeIBCMinimalDenom(channelInfo.sourceChannelId, channelInfo.coinMinimalDenom);

		const originCurrency = chainInfo.currencies.find(
			cur => cur.coinMinimalDenom === channelInfo.coinMinimalDenom
		) as Currency;

		if (!originCurrency) {
			throw new Error(`Unknown currency ${channelInfo.coinMinimalDenom} for ${channelInfo.counterpartyChainId}`);
		}

		const balance = queries.queryBalances.getQueryBech32Address(account.bech32Address).getBalanceFromCurrency({
			...originCurrency,
			coinMinimalDenom: ibcDenom,
			paths: [
				{
					portId: 'transfer',
					channelId: channelInfo.sourceChannelId,
				},
			],
			originChainId: chainInfo.chainId,
			originCurrency,
		});

		return {
			chainInfo: chainInfo,
			balance,
			sourceChannelId: channelInfo.sourceChannelId,
			destChannelId: channelInfo.destChannelId,
		};
	});

	const [dialogState, setDialogState] = React.useState<
		| {
				open: true;
				currency: IBCCurrency;
				counterpartyChainId: string;
				sourceChannelId: string;
				destChannelId: string;
				isWithdraw: boolean;
		  }
		| {
				open: false;
		  }
	>({ open: false });

	const close = () => setDialogState(v => ({ ...v, open: false }));
	return (
		<>
			{dialogState.open ? (
				<TransferDialog
					dialogStyle={{ minHeight: '533px', maxHeight: '540px', minWidth: '656px', maxWidth: '656px' }}
					isOpen={dialogState.open}
					close={close}
					currency={dialogState.currency}
					counterpartyChainId={dialogState.counterpartyChainId}
					sourceChannelId={dialogState.sourceChannelId}
					destChannelId={dialogState.destChannelId}
					isWithdraw={dialogState.isWithdraw}
				/>
			) : null}

			<TitleText>Osmosis Assets</TitleText>

			<table style={{ width: '100%' }}>
				<AssetBalanceHeader />

				<tbody style={{ width: '100%' }}>
					{chainStore.current.currencies
						.filter(cur => !cur.coinMinimalDenom.includes('/'))
						.map(cur => {
							const bal = queries.queryBalances
								.getQueryBech32Address(account.bech32Address)
								.getBalanceFromCurrency(cur);

							return (
								<AssetBalanceRow
									key={cur.coinMinimalDenom}
									chainName=""
									coinDenom={cur.coinDenom}
									currency={cur}
									balance={bal
										.hideDenom(true)
										.trim(true)
										.maxDecimals(6)
										.toString()}
								/>
							);
						})}
					{ibcBalances.map(bal => {
						const currency = bal.balance.currency;
						const coinDenom = (() => {
							if ('originCurrency' in currency && currency.originCurrency) {
								return currency.originCurrency.coinDenom;
							}

							return currency.coinDenom;
						})();

						/*
			if (
				bal.chainInfo.chainId.startsWith('regen-') &&
				(window.location.hostname.startsWith('app.') || window.location.hostname.startsWith('staging.'))
			) {
				// Channel of Regen network would not be public yet.
				// By the hard coding, just do not show the deposit/withdraw button for the regen network.
				return (
					<AssetBalanceRow
						key={currency.coinMinimalDenom}
						chainName={bal.chainInfo.chainName}
						coinDenom={coinDenom}
						currency={currency}
						balance={bal.balance
							.hideDenom(true)
							.trim(true)
							.maxDecimals(6)
							.toString()}
						showCommingSoon={true}
					/>
				);
			}
			 */

						return (
							<AssetBalanceRow
								key={currency.coinMinimalDenom}
								chainName={bal.chainInfo.chainName}
								coinDenom={coinDenom}
								currency={currency}
								balance={bal.balance
									.hideDenom(true)
									.trim(true)
									.maxDecimals(6)
									.toString()}
								onDeposit={() => {
									setDialogState({
										open: true,
										counterpartyChainId: bal.chainInfo.chainId,
										currency: currency as IBCCurrency,
										sourceChannelId: bal.sourceChannelId,
										destChannelId: bal.destChannelId,
										isWithdraw: false,
									});
								}}
								onWithdraw={() => {
									setDialogState({
										open: true,
										counterpartyChainId: bal.chainInfo.chainId,
										currency: currency as IBCCurrency,
										sourceChannelId: bal.sourceChannelId,
										destChannelId: bal.destChannelId,
										isWithdraw: true,
									});
								}}
							/>
						);
					})}
				</tbody>
			</table>
		</>
	);
});

function AssetBalanceHeader() {
	return (
		<thead>
			<TableHeaderRow>
				<TableData style={{ width: tableWidths[0] }}>
					<Text size="sm">Asset / Chain</Text>
				</TableData>
				<TableData style={{ paddingRight: 80, width: tableWidths[1], justifyContent: 'flex-end' }}>
					<Text size="sm">Balance</Text>
				</TableData>
				<TableData style={{ width: tableWidths[2] }}>
					<Text size="sm">IBC Deposit</Text>
				</TableData>
				<TableData style={{ width: tableWidths[3] }}>
					<Text size="sm">IBC Withdraw</Text>
				</TableData>
			</TableHeaderRow>
		</thead>
	);
}

const TableHeaderRow = styled.tr`
	display: flex;
	align-items: center;
	width: 100%;
	padding-left: 50px;
	padding-right: 60px;
	border-bottom-width: 1px;
	background-color: ${colorPrimary};
	border-top-left-radius: 1rem;
	border-top-right-radius: 1rem;
	color: ${colorWhiteRegular};
`;

interface AssetBalanceRowProps {
	chainName: string;
	coinDenom: string;
	currency: AppCurrency;
	balance: string;
	onDeposit?: () => void;
	onWithdraw?: () => void;
	showComingSoon?: boolean;
}

function AssetBalanceRow({
	chainName,
	coinDenom,
	currency,
	balance,
	onDeposit,
	onWithdraw,
	showComingSoon,
}: AssetBalanceRowProps) {
	return (
		<AssetBalanceRowContainer>
			<TableData style={{ width: tableWidths[0] }}>
				<Img loadingSpin style={{ width: `2.5rem`, height: `2.5rem`, marginRight: 20 }} src={currency.coinImageUrl} />
				<Text emphasis="medium">
					{chainName ? `${chainName} - ${coinDenom.toUpperCase()}` : coinDenom.toUpperCase()}
				</Text>
			</TableData>

			<TableData style={{ paddingRight: 80, width: tableWidths[1], justifyContent: 'flex-end' }}>
				<Text emphasis="medium">{balance}</Text>
			</TableData>

			<TableData style={{ width: tableWidths[2], position: showComingSoon ? 'relative' : 'initial' }}>
				{!showComingSoon && onDeposit ? (
					<ButtonFaint onClick={onDeposit} style={{ display: 'flex', alignItems: 'center' }}>
						<Text size="sm" color="gold">
							Deposit
						</Text>
						<Img src={'/public/assets/Icons/Right.svg'} />
					</ButtonFaint>
				) : null}
				{showComingSoon ? <ComingSoonText color="gold">🌲 LBP is live 🌲</ComingSoonText> : null}
			</TableData>

			<TableData style={{ width: tableWidths[3] }}>
				{!showComingSoon && onWithdraw ? (
					<ButtonFaint onClick={onWithdraw} style={{ display: 'flex', alignItems: 'center' }}>
						<Text size="sm" color="gold">
							Withdraw
						</Text>
						<Img src={'/public/assets/Icons/Right.svg'} />
					</ButtonFaint>
				) : null}
			</TableData>
		</AssetBalanceRowContainer>
	);
}

const ComingSoonText = styled(Text)`
	position: absolute;
	padding-left: 8px;
	width: 200px;
`;

const TableData = styled.td`
	display: flex;
	align-items: center;
	padding: 16px 8px;
`;

const AssetBalanceRowContainer = styled.tr`
	display: flex;
	width: 100%;
	height: 4.5rem;
	align-items: center;
	border-bottom-width: 1px;
	padding-left: 50px;
	padding-right: 60px;
`;
