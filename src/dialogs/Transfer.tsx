import cn from 'clsx';
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { IBCCurrency } from '@keplr-wallet/types';
import { AmountInput } from '../components/form/Inputs';
import { colorWhiteEmphasis } from '../emotionStyles/colors';
import { useStore } from '../stores';
import { Bech32Address } from '@keplr-wallet/cosmos';
import { getKeplrFromWindow, WalletStatus } from '@keplr-wallet/stores';
import { useFakeFeeConfig } from '../hooks/tx';
import { useBasicAmountConfig } from '../hooks/tx/basic-amount-config';
import { wrapBaseDialog } from './base';
import { useAccountConnection } from '../hooks/account/useAccountConnection';
import { ConnectAccountButton } from '../components/ConnectAccountButton';
import { Buffer } from 'buffer/';

export const TransferDialog = wrapBaseDialog(
	observer(
		({
			currency,
			counterpartyChainId,
			sourceChannelId,
			destChannelId,
			isWithdraw,
			close,
			isMobileView,

			ics20ContractAddress,
		}: {
			currency: IBCCurrency;
			counterpartyChainId: string;
			sourceChannelId: string;
			destChannelId: string;
			isWithdraw: boolean;
			close: () => void;
			isMobileView: boolean;

			ics20ContractAddress?: string;
		}) => {
			const { chainStore, accountStore, queriesStore, ibcTransferHistoryStore } = useStore();

			const account = accountStore.getAccount(chainStore.current.chainId);
			const counterpartyAccount = accountStore.getAccount(counterpartyChainId);

			const bal = queriesStore
				.get(chainStore.current.chainId)
				.queryBalances.getQueryBech32Address(account.bech32Address)
				.getBalanceFromCurrency(currency);
			const counterpartyBal = queriesStore
				.get(counterpartyChainId)
				.queryBalances.getQueryBech32Address(counterpartyAccount.bech32Address)
				.getBalanceFromCurrency(currency.originCurrency!);

			useEffect(() => {
				if (account.bech32Address && counterpartyAccount.walletStatus === WalletStatus.NotInit) {
					counterpartyAccount.init();
				}
			}, [account.bech32Address, counterpartyAccount.walletStatus]);

			const amountConfig = useBasicAmountConfig(
				chainStore,
				chainStore.current.chainId,
				pickOne(account.bech32Address, counterpartyAccount.bech32Address, isWithdraw),
				pickOne(currency, currency.originCurrency!, isWithdraw),
				pickOne(
					queriesStore.get(chainStore.current.chainId).queryBalances,
					queriesStore.get(counterpartyChainId).queryBalances,
					isWithdraw
				)
			);
			const feeConfig = useFakeFeeConfig(
				chainStore,
				pickOne(chainStore.current.chainId, counterpartyChainId, isWithdraw),
				pickOne(account.msgOpts.ibcTransfer.gas, counterpartyAccount.msgOpts.ibcTransfer.gas, isWithdraw)
			);
			amountConfig.setFeeConfig(feeConfig);

			const { isAccountConnected, connectAccount } = useAccountConnection();

			useEffect(() => {
				if (isAccountConnected && currency.originCurrency) {
					if ('contractAddress' in currency.originCurrency) {
						getKeplrFromWindow()
							.then(keplr => {
								// If the keplr is from extension and the ibc token is from cw20,
								// suggest the token to the keplr.
								if (keplr && keplr.mode === 'extension') {
									if (currency.originChainId && currency.originCurrency && 'contractAddress' in currency.originCurrency)
										keplr.suggestToken(currency.originChainId, currency.originCurrency.contractAddress).catch(e => {
											console.log(e);
										});
								}
							})
							.catch(e => {
								console.log(e);
							});
					}
				}
			}, [isAccountConnected, currency.originCurrency, currency.originChainId]);

			return (
				<div className="w-full h-full text-white-high">
					<div className="mb-5 md:mb-10 flex justify-between items-center w-full">
						<h5 className="text-lg md:text-xl">{isWithdraw ? 'Withdraw' : 'Deposit'} IBC Asset</h5>
					</div>
					<h6 className="mb-3 md:mb-4 text-base md:text-lg">IBC Transfer</h6>
					<section className="flex flex-col md:flex-row items-center">
						<div className="w-full flex-1 p-3 md:p-4 border border-white-faint rounded-2xl">
							<p className="text-white-high">From</p>
							<p className="text-white-disabled truncate overflow-ellipsis">
								{pickOne(
									Bech32Address.shortenAddress(account.bech32Address, 25),
									Bech32Address.shortenAddress(counterpartyAccount.bech32Address, 25),
									isWithdraw
								)}
							</p>
						</div>
						<div className="flex justify-center items-center w-10 my-2 md:my-0">
							<img src={`/public/assets/Icons/Arrow-${isMobileView ? 'Down' : 'Right'}.svg`} />
						</div>
						<div className="w-full flex-1 p-3 md:p-4 border border-white-faint rounded-2xl">
							<p className="text-white-high">To</p>
							<p className="text-white-disabled truncate overflow-ellipsis">
								{pickOne(
									Bech32Address.shortenAddress(counterpartyAccount.bech32Address, 25),
									Bech32Address.shortenAddress(account.bech32Address, 25),
									isWithdraw
								)}
							</p>
						</div>
					</section>
					<h6 className="text-base md:text-lg mt-7">Amount To {isWithdraw ? 'Withdraw' : 'Deposit'}</h6>
					<div className="mt-3 md:mt-4 w-full p-0 md:p-5 border-0 md:border border-secondary-50 border-opacity-60 rounded-2xl">
						<p className="text-sm md:text-base mb-2">
							Available balance:{' '}
							<span className="text-primary-50">
								{pickOne(
									bal
										.upperCase(true)
										.trim(true)
										.maxDecimals(6)
										.toString(),
									counterpartyBal
										.upperCase(true)
										.trim(true)
										.maxDecimals(6)
										.toString(),
									isWithdraw
								)}
							</span>
						</p>
						<div
							className="py-2 px-2.5 bg-background rounded-lg flex gap-5 relative"
							style={{ gridTemplateColumns: 'calc(100% - 60px) 40px' }}>
							<AmountInput
								type="number"
								style={{ color: colorWhiteEmphasis }}
								onChange={e => {
									e.preventDefault();
									amountConfig.setAmount(e.currentTarget.value);
								}}
								value={amountConfig.amount}
							/>
							<button
								onClick={() => amountConfig.toggleIsMax()}
								className={cn(
									'my-auto p-1.5 bg-white-faint hover:opacity-75 cursor-pointer flex justify-center items-center rounded-md absolute top-2 right-2 md:static',
									amountConfig.isMax && 'bg-primary-200'
								)}>
								<p className="text-xs text-white-high leading-none">MAX</p>
							</button>
						</div>
					</div>
					<div className="w-full mt-6 md:mt-9 flex items-center justify-center">
						{!isAccountConnected ? (
							<ConnectAccountButton
								className="w-full md:w-2/3 p-4 md:p-6 rounded-2xl"
								style={{ marginTop: isMobileView ? '16px' : '32px' }}
								onClick={e => {
									e.preventDefault();
									connectAccount();
								}}
							/>
						) : (
							<button
								className="w-full md:w-2/3 p-4 md:p-6 bg-primary-200 rounded-2xl flex items-center justify-center hover:opacity-75 disabled:opacity-50"
								disabled={
									!account.isReadyToSendMsgs ||
									!counterpartyAccount.isReadyToSendMsgs ||
									amountConfig.getError() != null
								}
								onClick={async e => {
									e.preventDefault();

									try {
										if (isWithdraw) {
											if (account.isReadyToSendMsgs && counterpartyAccount.bech32Address) {
												const sender = account.bech32Address;
												const recipient = counterpartyAccount.bech32Address;

												await account.cosmos.sendIBCTransferMsg(
													{
														portId: 'transfer',
														channelId: sourceChannelId,
														counterpartyChainId,
													},
													amountConfig.amount,
													amountConfig.currency,
													recipient,
													'',
													undefined,
													undefined,
													{
														onBroadcasted: (txHash: Uint8Array) =>
															ibcTransferHistoryStore.pushUncommitedHistore({
																txHash: Buffer.from(txHash).toString('hex'),
																sourceChainId: chainStore.current.chainId,
																destChainId: counterpartyChainId,
																amount: { amount: amountConfig.amount, currency: amountConfig.sendCurrency },
																recipient,
																sender,
															}),
														onFulfill: tx => {
															if (!tx.code) {
																const events = tx?.events as
																	| { type: string; attributes: { key: string; value: string }[] }[]
																	| undefined;
																if (events) {
																	for (const event of events) {
																		if (event.type === 'send_packet') {
																			const attributes = event.attributes;
																			const sourceChannelAttr = attributes.find(
																				attr => attr.key === Buffer.from('packet_src_channel').toString('base64')
																			);
																			const sourceChannel = sourceChannelAttr
																				? Buffer.from(sourceChannelAttr.value, 'base64').toString()
																				: undefined;
																			const destChannelAttr = attributes.find(
																				attr => attr.key === Buffer.from('packet_dst_channel').toString('base64')
																			);
																			const destChannel = destChannelAttr
																				? Buffer.from(destChannelAttr.value, 'base64').toString()
																				: undefined;
																			const sequenceAttr = attributes.find(
																				attr => attr.key === Buffer.from('packet_sequence').toString('base64')
																			);
																			const sequence = sequenceAttr
																				? Buffer.from(sequenceAttr.value, 'base64').toString()
																				: undefined;
																			const timeoutHeightAttr = attributes.find(
																				attr => attr.key === Buffer.from('packet_timeout_height').toString('base64')
																			);
																			const timeoutHeight = timeoutHeightAttr
																				? Buffer.from(timeoutHeightAttr.value, 'base64').toString()
																				: undefined;
																			const timeoutTimestampAttr = attributes.find(
																				attr => attr.key === Buffer.from('packet_timeout_timestamp').toString('base64')
																			);
																			const timeoutTimestamp = timeoutTimestampAttr
																				? Buffer.from(timeoutTimestampAttr.value, 'base64').toString()
																				: undefined;

																			if (sourceChannel && destChannel && sequence) {
																				ibcTransferHistoryStore.pushPendingHistory({
																					txHash: tx.hash,
																					sourceChainId: chainStore.current.chainId,
																					sourceChannelId: sourceChannel,
																					destChainId: counterpartyChainId,
																					destChannelId: destChannel,
																					sequence,
																					sender,
																					recipient,
																					amount: { amount: amountConfig.amount, currency: amountConfig.sendCurrency },
																					timeoutHeight,
																					timeoutTimestamp,
																				});
																			}
																		}
																	}
																}
															}

															close();
														},
													}
												);
											}
										} else {
											if (counterpartyAccount.isReadyToSendMsgs && account.bech32Address) {
												const sender = counterpartyAccount.bech32Address;
												const recipient = account.bech32Address;

												const txEvents = {
													onBroadcasted: (txHash: Uint8Array) =>
														ibcTransferHistoryStore.pushUncommitedHistore({
															txHash: Buffer.from(txHash).toString('hex'),
															sourceChainId: counterpartyChainId,
															destChainId: chainStore.current.chainId,
															amount: { amount: amountConfig.amount, currency: amountConfig.sendCurrency },
															sender,
															recipient,
														}),
													onFulfill: (tx: any) => {
														if (!tx.code) {
															const events = tx?.events as
																| { type: string; attributes: { key: string; value: string }[] }[]
																| undefined;
															if (events) {
																for (const event of events) {
																	if (event.type === 'send_packet') {
																		const attributes = event.attributes;
																		const sourceChannelAttr = attributes.find(
																			attr => attr.key === Buffer.from('packet_src_channel').toString('base64')
																		);
																		const sourceChannel = sourceChannelAttr
																			? Buffer.from(sourceChannelAttr.value, 'base64').toString()
																			: undefined;
																		const destChannelAttr = attributes.find(
																			attr => attr.key === Buffer.from('packet_dst_channel').toString('base64')
																		);
																		const destChannel = destChannelAttr
																			? Buffer.from(destChannelAttr.value, 'base64').toString()
																			: undefined;
																		const sequenceAttr = attributes.find(
																			attr => attr.key === Buffer.from('packet_sequence').toString('base64')
																		);
																		const sequence = sequenceAttr
																			? Buffer.from(sequenceAttr.value, 'base64').toString()
																			: undefined;
																		const timeoutHeightAttr = attributes.find(
																			attr => attr.key === Buffer.from('packet_timeout_height').toString('base64')
																		);
																		const timeoutHeight = timeoutHeightAttr
																			? Buffer.from(timeoutHeightAttr.value, 'base64').toString()
																			: undefined;
																		const timeoutTimestampAttr = attributes.find(
																			attr => attr.key === Buffer.from('packet_timeout_timestamp').toString('base64')
																		);
																		const timeoutTimestamp = timeoutTimestampAttr
																			? Buffer.from(timeoutTimestampAttr.value, 'base64').toString()
																			: undefined;

																		if (sourceChannel && destChannel && sequence) {
																			ibcTransferHistoryStore.pushPendingHistory({
																				txHash: tx.hash,
																				sourceChainId: counterpartyChainId,
																				sourceChannelId: sourceChannel,
																				destChainId: chainStore.current.chainId,
																				destChannelId: destChannel,
																				sequence,
																				sender,
																				recipient,
																				amount: { amount: amountConfig.amount, currency: amountConfig.sendCurrency },
																				timeoutHeight,
																				timeoutTimestamp,
																			});
																		}
																	}
																}
															}
														}

														close();
													},
												};

												if (ics20ContractAddress) {
													if (!currency.originCurrency || !('contractAddress' in currency.originCurrency)) {
														throw new Error(
															'IBC is requested to be used via cosmwam, but the provided currency does not have a contract address'
														);
													}

													const msg = {
														channel: destChannelId,
														remote_address: recipient,
														// 15 min
														timeout: 900,
													};

													await counterpartyAccount.cosmwasm.sendExecuteContractMsg(
														'ibcTransfer' as any,
														currency.originCurrency.contractAddress,
														{
															send: {
																contract: ics20ContractAddress,
																amount: amountConfig.getAmountPrimitive().amount,
																msg: Buffer.from(JSON.stringify(msg)).toString('base64'),
															},
														},
														[],
														'',
														{
															gas: '350000',
														},
														undefined,
														txEvents
													);
												} else {
													await counterpartyAccount.cosmos.sendIBCTransferMsg(
														{
															portId: 'transfer',
															channelId: destChannelId,
															counterpartyChainId: chainStore.current.chainId,
														},
														amountConfig.amount,
														amountConfig.currency,
														recipient,
														'',
														undefined,
														undefined,
														txEvents
													);
												}
											}
										}
									} catch (e) {
										console.log(e);
									}
								}}>
								{(isWithdraw && account.isSendingMsg === 'ibcTransfer') ||
								(!isWithdraw && counterpartyAccount.isSendingMsg === 'ibcTransfer') ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										className="animate-spin md:-ml-1 md:mr-3 h-5 w-5 text-white"
										viewBox="0 0 24 24">
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
										<path
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											className="opacity-75"
										/>
									</svg>
								) : (
									<h6 className="text-base md:text-lg">{isWithdraw ? 'Withdraw' : 'Deposit'}</h6>
								)}
							</button>
						)}
					</div>
				</div>
			);
		}
	)
);

function pickOne<V1, V2>(v1: V1, v2: V2, first: boolean): V1 | V2 {
	return first ? v1 : v2;
}
