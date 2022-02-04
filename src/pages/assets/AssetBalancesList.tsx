import styled from '@emotion/styled';
import { AppCurrency, IBCCurrency } from '@keplr-wallet/types';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Img } from 'src/components/common/Img';
import { ButtonFaint, ButtonSecondary } from 'src/components/layouts/Buttons';
import { Text, TitleText } from 'src/components/Texts';
import { IBCAssetInfos } from 'src/config';
import { TransferDialog } from 'src/dialogs/Transfer';
import { TableData, TableHeaderRow } from 'src/pages/assets/components/Table';
import { useStore } from 'src/stores';
import { makeIBCMinimalDenom } from 'src/utils/ibc';
import useWindowSize from 'src/hooks/useWindowSize';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { Dec } from '@keplr-wallet/unit';

const tableWidths = ['45%', '25%', '15%', '15%'];
const tableWidthsOnMobileView = ['70%', '30%'];

export const AssetBalancesList = observer(function AssetBalancesList() {
	const { chainStore, queriesStore, accountStore, priceStore } = useStore();

	const { isMobileView } = useWindowSize();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const ibcBalances = IBCAssetInfos.map(channelInfo => {
		const chainInfo = chainStore.getChain(channelInfo.counterpartyChainId);
		const ibcDenom = makeIBCMinimalDenom(channelInfo.sourceChannelId, channelInfo.coinMinimalDenom);

		const originCurrency = chainInfo.currencies.find(cur => {
			if (channelInfo.coinMinimalDenom.startsWith('cw20:')) {
				return cur.coinMinimalDenom.startsWith(channelInfo.coinMinimalDenom);
			}

			return cur.coinMinimalDenom === channelInfo.coinMinimalDenom;
		});

		if (!originCurrency) {
			throw new Error(`Unknown currency ${channelInfo.coinMinimalDenom} for ${channelInfo.counterpartyChainId}`);
		}

		const balance = queries.queryBalances.getQueryBech32Address(account.bech32Address).getBalanceFromCurrency({
			coinDecimals: originCurrency.coinDecimals,
			coinGeckoId: originCurrency.coinGeckoId,
			coinImageUrl: originCurrency.coinImageUrl,
			coinDenom: originCurrency.coinDenom,
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
			isUnstable: channelInfo.isUnstable,
			ics20ContractAddress: channelInfo.ics20ContractAddress,
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
				ics20ContractAddress?: string;
		  }
		| {
				open: false;
		  }
	>({ open: false });

	const close = () => setDialogState(v => ({ ...v, open: false }));

	return (
		<React.Fragment>
			{dialogState.open ? (
				<TransferDialog
					dialogStyle={
						isMobileView ? {} : { minHeight: '533px', maxHeight: '540px', minWidth: '656px', maxWidth: '656px' }
					}
					isOpen={dialogState.open}
					close={close}
					currency={dialogState.currency}
					counterpartyChainId={dialogState.counterpartyChainId}
					sourceChannelId={dialogState.sourceChannelId}
					destChannelId={dialogState.destChannelId}
					isWithdraw={dialogState.isWithdraw}
					isMobileView={isMobileView}
					ics20ContractAddress={dialogState.ics20ContractAddress}
				/>
			) : null}
			<div className="px-5 md:px-0">
				<TitleText isMobileView={isMobileView}>Osmosis Assets</TitleText>
			</div>
			<table className="w-full pb-8">
				<AssetBalanceHeader isMobileView={isMobileView} />

				<tbody className="w-full">
					{chainStore.current.currencies
						.filter(cur => !cur.coinMinimalDenom.includes('/'))
						.map(cur => {
							const bal = queries.queryBalances
								.getQueryBech32Address(account.bech32Address)
								.getBalanceFromCurrency(cur);

							const totalFiatValue = priceStore.calculatePrice(bal, 'usd');

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
									totalFiatValue={totalFiatValue}
									isMobileView={isMobileView}
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

						const totalFiatValue = priceStore.calculatePrice(bal.balance, 'usd');

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
								totalFiatValue={totalFiatValue}
								onDeposit={() => {
									setDialogState({
										open: true,
										counterpartyChainId: bal.chainInfo.chainId,
										currency: currency as IBCCurrency,
										sourceChannelId: bal.sourceChannelId,
										destChannelId: bal.destChannelId,
										isWithdraw: false,
										ics20ContractAddress: bal.ics20ContractAddress,
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
										ics20ContractAddress: bal.ics20ContractAddress,
									});
								}}
								isUnstable={bal.isUnstable}
								isMobileView={isMobileView}
							/>
						);
					})}
				</tbody>
			</table>
		</React.Fragment>
	);
});

interface AssetBalanceHeaderProps {
	isMobileView: boolean;
}

function AssetBalanceHeader({ isMobileView }: AssetBalanceHeaderProps) {
	return (
		<thead>
			<TableHeaderRow>
				<TableData style={{ width: isMobileView ? tableWidthsOnMobileView[0] : tableWidths[0] }}>
					<Text size="sm">Asset / Chain</Text>
				</TableData>
				<TableData
					className="md:!pr-4 lg:!pr-20 !justify-end"
					style={{
						width: isMobileView ? tableWidthsOnMobileView[1] : tableWidths[1],
					}}>
					<Text size="sm">Balance</Text>
				</TableData>

				{!isMobileView && (
					<TableData style={{ width: tableWidths[2] }}>
						<Text size="sm">IBC Deposit</Text>
					</TableData>
				)}
				{!isMobileView && (
					<TableData style={{ width: tableWidths[3] }}>
						<Text size="sm">IBC Withdraw</Text>
					</TableData>
				)}
			</TableHeaderRow>
		</thead>
	);
}

interface AssetBalanceRowProps {
	chainName: string;
	coinDenom: string;
	currency: AppCurrency;
	balance: string;
	totalFiatValue?: PricePretty;
	onDeposit?: () => void;
	onWithdraw?: () => void;
	isUnstable?: boolean;
	showComingSoon?: boolean;
	isMobileView: boolean;
}

function AssetBalanceRow({
	chainName,
	coinDenom,
	currency,
	balance,
	totalFiatValue,
	onDeposit,
	onWithdraw,
	isUnstable,
	isMobileView,
}: AssetBalanceRowProps) {
	const isCW20 =
		'originCurrency' in currency && currency.originCurrency && 'contractAddress' in currency.originCurrency;

	return (
		<React.Fragment>
			<AssetBalanceRowContainer>
				<AssetBalanceTableRow>
					<TableData style={{ width: isMobileView ? tableWidthsOnMobileView[0] : tableWidths[0] }}>
						<Img
							loadingSpin
							style={{ width: `2.5rem`, height: `2.5rem`, marginRight: isMobileView ? 10 : 20 }}
							src={currency.coinImageUrl}
						/>
						<Text emphasis="medium" isMobileView={isMobileView}>
							{chainName ? `${chainName} - ${coinDenom.toUpperCase()}` : coinDenom.toUpperCase()}
						</Text>
						{isCW20 ? <div className="ml-2 px-2 py-1 rounded-full font-title text-xs bg-primary-200">CW20</div> : null}
					</TableData>
					<TableData
						className="md:!pr-3 lg:!pr-20 !justify-end"
						style={{
							width: isMobileView ? tableWidthsOnMobileView[1] : tableWidths[1],
						}}>
						<div className="flex flex-col items-end">
							<Text emphasis="medium" isMobileView={isMobileView}>
								{balance}
							</Text>
							{totalFiatValue && totalFiatValue.toDec().gt(new Dec(0)) ? (
								<Text size="sm">{totalFiatValue.toString()}</Text>
							) : null}
						</div>
					</TableData>
					{!isMobileView && (
						<TableData style={{ width: tableWidths[2] }}>
							{onDeposit ? (
								<React.Fragment>
									<div className="relative group">
										<ButtonFaint
											onClick={onDeposit}
											style={{ display: 'flex', alignItems: 'center' }}
											disabled={isUnstable === true}>
											<p className="text-sm text-secondary-200 leading-none">Deposit</p>
											<img alt="right" src={'/public/assets/Icons/Right.svg'} />
										</ButtonFaint>
										{isUnstable ? (
											<div
												className="absolute invisible group-hover:visible bg-black text-white-high text-center opacity-80 px-3 py-2 rounded-xl"
												style={{
													left: '50%',
													transform: 'translateX(-50%)',
													minWidth: '200px',
													bottom: '30px',
												}}>
												<span>IBC deposit/withdrawal is temporarily disabled</span>
											</div>
										) : null}
									</div>
								</React.Fragment>
							) : null}
						</TableData>
					)}
					{!isMobileView && (
						<TableData style={{ width: tableWidths[3] }}>
							{onWithdraw ? (
								<React.Fragment>
									<div className="relative group">
										<ButtonFaint
											onClick={onWithdraw}
											style={{ display: 'flex', alignItems: 'center' }}
											disabled={isUnstable === true}>
											<p className="text-sm text-secondary-200 leading-none">Withdraw</p>
											<img alt="right" src={'/public/assets/Icons/Right.svg'} />
										</ButtonFaint>
										{isUnstable ? (
											<div
												className="absolute invisible group-hover:visible bg-black text-white-high text-center opacity-80 px-3 py-2 rounded-xl"
												style={{
													left: '50%',
													transform: 'translateX(-50%)',
													minWidth: '200px',
													bottom: '30px',
												}}>
												<span>IBC deposit/withdrawal is temporarily disabled</span>
											</div>
										) : null}
									</div>
								</React.Fragment>
							) : null}
						</TableData>
					)}
				</AssetBalanceTableRow>
				{isMobileView && (onWithdraw || onDeposit) && (
					<IBCTransferButtonsOnMobileView>
						{onWithdraw ? (
							<ButtonSecondary isOutlined onClick={onWithdraw} style={{ width: '100%' }} disabled={isUnstable === true}>
								<p className="text-sm text-secondary-200">Withdraw</p>
							</ButtonSecondary>
						) : null}
						{onDeposit ? (
							<ButtonSecondary onClick={onDeposit} style={{ width: '100%' }} disabled={isUnstable === true}>
								<p className="text-sm">Deposit</p>
							</ButtonSecondary>
						) : null}
					</IBCTransferButtonsOnMobileView>
				)}
			</AssetBalanceRowContainer>
		</React.Fragment>
	);
}

const AssetBalanceRowContainer = styled.div`
	border-bottom-width: 1px;
`;

const AssetBalanceTableRow = styled.tr`
	display: flex;
	width: 100%;
	align-items: center;
	padding-left: 14px;
	padding-right: 14px;

	@media (min-width: 768px) {
		padding-left: 30px;
		padding-right: 30px;
		max-height: 72px;
	}
`;

const IBCTransferButtonsOnMobileView = styled.div`
	display: flex;
	gap: 20px;
	padding: 10px 20px 20px;
`;
