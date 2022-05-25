import { IBCCurrencyRegsitrar, QueriesStore } from '@keplr-wallet/stores';
import { AccountStore } from '@keplr-wallet/stores';
import { DenomHelper, IndexedDBKVStore, LocalKVStore } from '@keplr-wallet/common';
import { ChainInfoWithExplorer, ChainStore } from './chain';
import { AppCurrency, ChainInfo, Keplr } from '@keplr-wallet/types';
import { EmbedChainInfos, IBCAssetInfos } from '../config';
import { QueriesWithCosmosAndOsmosis } from './osmosis/query';
import { AccountWithCosmosAndOsmosis } from './osmosis/account';
import { LayoutStore } from './layout';
import { GammSwapManager } from './osmosis/swap';
import { LPCurrencyRegistrar } from './osmosis/currency-registrar';
import { ChainInfoInner } from '@keplr-wallet/stores';
import { PoolIntermediatePriceStore } from './price';
import { IBCTransferHistoryStore } from './ibc-history';
import { displayToast, TToastType } from '../components/common/toasts';
import { isSlippageError } from '../utils/tx';
import { prettifyTxError } from 'src/stores/prettify-tx-error';
import { KeplrWalletConnectV1 } from '@keplr-wallet/wc-client';
import { ConnectWalletManager } from 'src/dialogs/connect-wallet';

export class RootStore {
	public readonly chainStore: ChainStore;
	public readonly accountStore: AccountStore<AccountWithCosmosAndOsmosis>;
	public readonly queriesStore: QueriesStore<QueriesWithCosmosAndOsmosis>;
	public readonly priceStore: PoolIntermediatePriceStore;

	public readonly ibcTransferHistoryStore: IBCTransferHistoryStore;

	public readonly swapManager: GammSwapManager;
	public readonly connectWalletManager: ConnectWalletManager;

	protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar<ChainInfoWithExplorer>;
	protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithExplorer>;

	public readonly layoutStore: LayoutStore;

	constructor() {
		this.chainStore = new ChainStore(EmbedChainInfos, EmbedChainInfos[0].chainId);
		this.connectWalletManager = new ConnectWalletManager(this.chainStore);

		this.queriesStore = new QueriesStore(
			new IndexedDBKVStore('store_web_queries'),
			this.chainStore,
			this.connectWalletManager.getKeplr,
			QueriesWithCosmosAndOsmosis
		);

		this.accountStore = new AccountStore<AccountWithCosmosAndOsmosis>(
			window,
			AccountWithCosmosAndOsmosis,
			this.chainStore,
			this.queriesStore,
			{
				defaultOpts: {
					prefetching: false,
					suggestChain: true,
					autoInit: false,
					getKeplr: this.connectWalletManager.getKeplr,
					suggestChainFn: async (keplr, chainInfo) => {
						if (keplr.mode === 'mobile-web') {
							// Can't suggest the chain on mobile web.
							return;
						}

						if (keplr instanceof KeplrWalletConnectV1) {
							// Can't suggest the chain using wallet connect.
							return;
						}

						// Fetching the price from the pool's spot price is slightly hacky.
						// It is set on the custom coin gecko id start with "pool:"
						// and custom price store calculates the spot price from the pool
						// and calculates the actual price with multiplying the known price from the coingecko of the other currency.
						// But, this logic is not supported on the Keplr extension,
						// so, delivering this custom coingecko id doesn't work on the Keplr extension.
						const copied = JSON.parse(JSON.stringify(chainInfo.raw)) as ChainInfo;
						if (copied.stakeCurrency.coinGeckoId?.startsWith('pool:')) {
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							delete copied.stakeCurrency.coinGeckoId;
						}
						for (const currency of copied.currencies) {
							if (currency.coinGeckoId?.startsWith('pool:')) {
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								delete currency.coinGeckoId;
							}
						}
						for (const currency of copied.feeCurrencies) {
							if (currency.coinGeckoId?.startsWith('pool:')) {
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								delete currency.coinGeckoId;
							}
						}

						await keplr.experimentalSuggestChain(copied);
					},
				},
				chainOpts: this.chainStore.chainInfos.map(chainInfo => {
					return {
						chainId: chainInfo.chainId,
						msgOpts: { ibcTransfer: { gas: 130000 } },
						preTxEvents: {
							onBroadcastFailed: (e?: Error) => {
								let message: string = 'Unknown error';
								if (e instanceof Error) {
									message = e.message;
								} else if (typeof e === 'string') {
									message = e;
								}

								try {
									message = prettifyTxError(message, chainInfo.currencies);
								} catch (e) {
									console.log(e);
								}

								displayToast(TToastType.TX_FAILED, {
									message,
								});
							},
							onBroadcasted: (txHash: Uint8Array) => {
								displayToast(TToastType.TX_BROADCASTING);
							},
							onFulfill: (tx: any) => {
								if (tx.code) {
									let message: string = tx.log;

									if (isSlippageError(tx)) {
										message = 'Swap failed. Liquidity may not be sufficient. Try adjusting the allowed slippage.';
									} else {
										try {
											message = prettifyTxError(message, chainInfo.currencies);
										} catch (e) {
											console.log(e);
										}
									}

									displayToast(TToastType.TX_FAILED, { message });
								} else {
									displayToast(TToastType.TX_SUCCESSFUL, {
										customLink: chainInfo.raw.explorerUrlToTx.replace('{txHash}', tx.hash.toUpperCase()),
									});
								}
							},
						},
					};
				}),
			}
		);
		this.connectWalletManager.setAccountStore(this.accountStore);

		this.priceStore = new PoolIntermediatePriceStore(
			EmbedChainInfos[0].chainId,
			this.chainStore,
			new IndexedDBKVStore('store_web_prices'),
			{
				usd: {
					currency: 'usd',
					symbol: '$',
					maxDecimals: 2,
					locale: 'en-US',
				},
			},
			'usd',
			this.queriesStore.get(EmbedChainInfos[0].chainId).osmosis.queryGammPools,
			[
				{
					alternativeCoinId: 'pool:uosmo',
					poolId: '1',
					spotPriceSourceDenom: 'uosmo',
					spotPriceDestDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
					destCoinId: 'cosmos',
				},
				{
					alternativeCoinId: 'pool:uion',
					poolId: '2',
					spotPriceSourceDenom: 'uion',
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'pool:uosmo',
				},
				{
					alternativeCoinId: 'pool:uregen',
					poolId: '21',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-8' }], 'uregen'),
					spotPriceDestDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
					destCoinId: 'cosmos',
				},
				{
					alternativeCoinId: 'pool:ujuno',
					poolId: '498',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-42' }], 'ujuno'),
					spotPriceDestDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
					destCoinId: 'cosmos',
				},
				{
					alternativeCoinId: 'pool:utick',
					poolId: '547',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-39' }], 'utick'),
					spotPriceDestDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
					destCoinId: 'cosmos',
				},
				{
					alternativeCoinId: 'pool:uixo',
					poolId: '558',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-38' }], 'uixo'),
					spotPriceDestDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
					destCoinId: 'cosmos',
				},
				{
					alternativeCoinId: 'pool:ubtsg',
					poolId: '573',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-73' }], 'ubtsg'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:uxki',
					poolId: '577',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-77' }], 'uxki'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'pool:uosmo',
				},
				{
					alternativeCoinId: 'pool:ustars',
					poolId: '604',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-75' }], 'ustars'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:uhuahua',
					poolId: '606',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-113' }], 'uhuahua'),
					spotPriceDestDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
					destCoinId: 'cosmos',
				},
				{
					alternativeCoinId: 'pool:ulum',
					poolId: '608',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-115' }], 'ulum'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:udsm',
					poolId: '618',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-135' }], 'udsm'),
					spotPriceDestDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
					destCoinId: 'cosmos',
				},
				{
					alternativeCoinId: 'pool:udig',
					poolId: '621',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-128' }], 'udig'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:ugraviton',
					poolId: '625',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-144' }], 'ugraviton'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:usomm',
					poolId: '627',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-165' }], 'usomm'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:udarc',
					poolId: '637',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-171' }], 'udarc'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:neta',
					poolId: '631',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[{ portId: 'transfer', channelId: 'channel-169' }],
						'cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr'
					),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:marble',
					poolId: '649',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[{ portId: 'transfer', channelId: 'channel-169' }],
						'cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl'
					),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:uumee',
					poolId: '641',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-184' }], 'uumee'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:pstake',
					poolId: '648',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[
							{ portId: 'transfer', channelId: 'channel-4' },
							{ portId: 'transfer', channelId: 'channel-38' },
						],
						'gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006'
					),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:crbrus',
					poolId: '662',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-212' }], 'ucrbrus'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:hope',
					poolId: '653',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[{ portId: 'transfer', channelId: 'channel-169' }],
						'cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z'
					),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:rac',
					poolId: '669',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[{ portId: 'transfer', channelId: 'channel-169' }],
						'cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa'
					),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:umntl',
					poolId: '690',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-232' }], 'umntl'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:block',
					poolId: '691',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[{ portId: 'transfer', channelId: 'channel-169' }],
						'cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq'
					),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:nhash',
					poolId: '693',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-222' }], 'nhash'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:uglx',
					poolId: '697',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-236' }], 'uglx'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:dhk',
					poolId: '695',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[{ portId: 'transfer', channelId: 'channel-169' }],
						'cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49'
					),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:raw',
					poolId: '700',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[{ portId: 'transfer', channelId: 'channel-169' }],
						'cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g'
					),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:umeme',
					poolId: '701',
					spotPriceSourceDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-238' }], 'umeme'),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
				{
					alternativeCoinId: 'pool:asvt',
					poolId: '716',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[{ portId: 'transfer', channelId: 'channel-169' }],
						'cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w'
					),
					spotPriceDestDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-47' }], 'rowan'),
					destCoinId: 'sifchain',
				},
				{
					alternativeCoinId: 'pool:joe',
					poolId: '718',
					spotPriceSourceDenom: DenomHelper.ibcDenom(
						[{ portId: 'transfer', channelId: 'channel-169' }],
						'cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3'
					),
					spotPriceDestDenom: 'uosmo',
					destCoinId: 'osmosis',
				},
			]
		);

		this.ibcTransferHistoryStore = new IBCTransferHistoryStore(
			new IndexedDBKVStore('ibc_transfer_history'),
			this.chainStore
		);

		this.swapManager = new GammSwapManager([
			{
				poolId: '1',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '2',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uion',
						coinDenom: 'ION',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '3',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-1' }], 'uakt'),
						coinDenom: 'AKT',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '4',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-1' }], 'uakt'),
						coinDenom: 'AKT',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '5',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-2' }], 'udvpn'),
						coinDenom: 'DVPN',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '6',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-2' }], 'udvpn'),
						coinDenom: 'DVPN',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '7',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-6' }], 'uiris'),
						coinDenom: 'IRIS',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '8',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-6' }], 'uiris'),
						coinDenom: 'IRIS',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '9',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-5' }], 'basecro'),
						coinDenom: 'CRO',
						coinDecimals: 8,
					},
				],
			},
			{
				poolId: '10',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-5' }], 'basecro'),
						coinDenom: 'CRO',
						coinDecimals: 8,
					},
				],
			},
			{
				poolId: '13',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-4' }], 'uxprt'),
						coinDenom: 'XPRT',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '15',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-4' }], 'uxprt'),
						coinDenom: 'XPRT',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '22',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-8' }], 'uregen'),
						coinDenom: 'REGEN',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '42',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-8' }], 'uregen'),
						coinDenom: 'REGEN',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '183',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-15' }], 'uiov'),
						coinDenom: 'IOV',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '197',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-15' }], 'uiov'),
						coinDenom: 'IOV',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '461',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-37' }], 'ungm'),
						coinDenom: 'NGM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-37' }], 'eeur'),
						coinDenom: 'EEUR',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '463',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-37' }], 'ungm'),
						coinDenom: 'NGM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '481',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-37' }], 'eeur'),
						coinDenom: 'EEUR',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '482',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-37' }], 'eeur'),
						coinDenom: 'EEUR',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '497',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-42' }], 'ujuno'),
						coinDenom: 'JUNO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '498',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-42' }], 'ujuno'),
						coinDenom: 'JUNO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '547',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-39' }], 'utick'),
						coinDenom: 'TICK',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '553',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-53' }], 'nanolike'),
						coinDenom: 'LIKE',
						coinDecimals: 9,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '557',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-38' }], 'uixo'),
						coinDenom: 'IXO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '558',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-38' }], 'uixo'),
						coinDenom: 'IXO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '560',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-72' }], 'uusd'),
						coinDenom: 'UST',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '561',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-72' }], 'uluna'),
						coinDenom: 'LUNA',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '565',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-72' }], 'uluna'),
						coinDenom: 'LUNA',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '571',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-51' }], 'ubcna'),
						coinDenom: 'BCNA',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '572',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-51' }], 'ubcna'),
						coinDenom: 'BCNA',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '573',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-73' }], 'ubtsg'),
						coinDenom: 'BTSG',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '574',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-73' }], 'ubtsg'),
						coinDenom: 'BTSG',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '577',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-77' }], 'uxki'),
						coinDenom: 'XKI',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '578',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-77' }], 'uxki'),
						coinDenom: 'XKI',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-72' }], 'uusd'),
						coinDenom: 'UST',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '582',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-72' }], 'ukrw'),
						coinDenom: 'KRT',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-72' }], 'uusd'),
						coinDenom: 'UST',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '584',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-88' }], 'uscrt'),
						coinDenom: 'SCRT',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '585',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-88' }], 'uscrt'),
						coinDenom: 'SCRT',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '586',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-82' }], 'umed'),
						coinDenom: 'MED',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '587',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-82' }], 'umed'),
						coinDenom: 'MED',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '596',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-95' }], 'boot'),
						coinDenom: 'BOOT',
						coinDecimals: 0,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '597',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-95' }], 'boot'),
						coinDenom: 'BOOT',
						coinDecimals: 0,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '600',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-87' }], 'ucmdx'),
						coinDenom: 'CMDX',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '601',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-87' }], 'ucmdx'),
						coinDenom: 'CMDX',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '602',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-108' }], 'ncheq'),
						coinDenom: 'CHEQ',
						coinDecimals: 9,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '604',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-75' }], 'ustars'),
						coinDenom: 'STARS',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '605',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-113' }], 'uhuahua'),
						coinDenom: 'HUAHUA',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '606',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-113' }], 'uhuahua'),
						coinDenom: 'HUAHUA',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '608',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-115' }], 'ulum'),
						coinDenom: 'LUM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '611',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-75' }], 'ustars'),
						coinDenom: 'STARS',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '612',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-4' }], 'uxprt'),
						coinDenom: 'XPRT',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-72' }], 'uusd'),
						coinDenom: 'UST',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '613',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-124' }], 'uvdl'),
						coinDenom: 'VDL',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '617',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-108' }], 'ncheq'),
						coinDenom: 'CHEQ',
						coinDecimals: 9,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '618',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-135' }], 'udsm'),
						coinDenom: 'DSM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '619',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-135' }], 'udsm'),
						coinDenom: 'DSM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '621',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-128' }], 'udig'),
						coinDenom: 'DIG',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '625',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-144' }], 'ugraviton'),
						coinDenom: 'GRAV',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '627',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-165' }], 'usomm'),
						coinDenom: 'SOMM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '629',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-47' }], 'rowan'),
						coinDenom: 'ROWAN',
						coinDecimals: 18,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '626',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-148' }], 'uband'),
						coinDenom: 'BAND',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '637',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-171' }], 'udarc'),
						coinDenom: 'DARC',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '638',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-171' }], 'udarc'),
						coinDenom: 'DARC',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '631',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr'
						),
						coinDenom: 'NETA',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '641',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-184' }], 'uumee'),
						coinDenom: 'UMEE',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '642',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-184' }], 'uumee'),
						coinDenom: 'UMEE',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-72' }], 'uusd'),
						coinDenom: 'UST',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '644',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-181' }], 'udec'),
						coinDenom: 'DEC',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '648',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[
								{ portId: 'transfer', channelId: 'channel-4' },
								{ portId: 'transfer', channelId: 'channel-38' },
							],
							'gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006'
						),
						coinDenom: 'PSTAKE',
						coinDecimals: 18,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '649',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl'
						),
						coinDenom: 'MARBLE',
						coinDecimals: 3,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '651',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-188' }], 'swth'),
						coinDenom: 'SWTH',
						coinDecimals: 8,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '658',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-212' }], 'ucrbrus'),
						coinDenom: 'CRBRUS',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-113' }], 'uhuahua'),
						coinDenom: 'HUAHUA',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '653',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z'
						),
						coinDenom: 'HOPE',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '662',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-212' }], 'ucrbrus'),
						coinDenom: 'CRBRUS',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '669',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa'
						),
						coinDenom: 'RAC',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '633',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-144' }],
							'gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
						),
						coinDenom: 'g-USDC',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '694',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-144' }],
							'gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
						),
						coinDenom: 'g-WBTC',
						coinDecimals: 8,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},

			{
				poolId: '634',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-144' }],
							'gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
						),
						coinDenom: 'g-WETH',
						coinDecimals: 18,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '635',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-144' }],
							'gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
						),
						coinDenom: 'g-USDC',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-144' }],
							'gravity0x6B175474E89094C44Da98b954EedeAC495271d0F'
						),
						coinDenom: 'g-DAI',
						coinDecimals: 18,
					},
				],
			},
			{
				poolId: '670',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-144' }],
							'gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
						),
						coinDenom: 'g-USDC',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '678',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-208' }], 'uusdc'),
						coinDenom: 'USDC',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '679',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-208' }], 'frax-wei'),
						coinDenom: 'FRAX',
						coinDecimals: 18,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-208' }], 'uusdt'),
						coinDenom: 'USDT',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-208' }], 'uusdc'),
						coinDenom: 'USDC',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '681',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-229' }], 'afet'),
						coinDenom: 'FET',
						coinDecimals: 18,
					},
				],
			},
			{
				poolId: '682',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-229' }], 'afet'),
						coinDenom: 'FET',
						coinDecimals: 18,
					},
				],
			},
			{
				poolId: '690',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-232' }], 'umntl'),
						coinDenom: 'MNTL',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '691',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq'
						),
						coinDenom: 'BLOCK',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '693',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-222' }], 'nhash'),
						coinDenom: 'HASH',
						coinDecimals: 9,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '697',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-236' }], 'uglx'),
						coinDenom: 'GLX',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '695',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49'
						),
						coinDenom: 'DHK',
						coinDecimals: 0,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '699',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g'
						),
						coinDenom: 'RAW',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-208' }], 'dai-wei'),
						coinDenom: 'DAI',
						coinDecimals: 18,
					},
				],
			},
			{
				poolId: '700',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g'
						),
						coinDenom: 'RAW',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '674',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-208' }], 'dai-wei'),
						coinDenom: 'DAI',
						coinDecimals: 18,
					},
				],
			},
			{
				poolId: '704',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-208' }], 'weth-wei'),
						coinDenom: 'WETH',
						coinDecimals: 18,
					},
				],
			},
			{
				poolId: '712',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-208' }], 'wbtc-satoshi'),
						coinDenom: 'WBTC',
						coinDecimals: 8,
					},
				],
			},
			{
				poolId: '701',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-238' }], 'umeme'),
						coinDenom: 'MEME',
						coinDecimals: 6,
					},
				],
			},
			{
				poolId: '716',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w'
						),
						coinDenom: 'ASVT',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-47' }], 'rowan'),
						coinDenom: 'ROWAN',
						coinDecimals: 18,
					},
				],
			},
			{
				poolId: '718',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom(
							[{ portId: 'transfer', channelId: 'channel-169' }],
							'cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3'
						),
						coinDenom: 'JOE',
						coinDecimals: 6,
          },
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
      },
      {
				poolId: '722',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-204' }], 'aevmos'),
						coinDenom: 'EVMOS',
						coinDecimals: 18,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
			},
      {
				poolId: '715',
				currencies: [
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-221' }], 'uatolo'),
						coinDenom: 'ATOLO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
				],
      },
		]);

		this.lpCurrencyRegistrar = new LPCurrencyRegistrar(this.chainStore);
		this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar<ChainInfoWithExplorer>(
			new LocalKVStore('store_ibc_currency_registrar'),
			3 * 24 * 3600 * 1000, // 3 days
			this.chainStore,
			this.accountStore,
			this.queriesStore,
			this.queriesStore,
			(
				denomTrace: {
					denom: string;
					paths: {
						portId: string;
						channelId: string;
					}[];
				},
				originChainInfo: ChainInfoInner | undefined,
				counterpartyChainInfo: ChainInfoInner | undefined,
				originCurrency: AppCurrency | undefined
			) => {
				const firstPath = denomTrace.paths[0];

				// If the IBC Currency's channel is known,
				// Don't show the channel info on the coin denom.
				const knownAssetInfo = IBCAssetInfos.filter(info => info.sourceChannelId === firstPath.channelId).find(
					info => info.coinMinimalDenom === denomTrace.denom
				);
				if (knownAssetInfo) {
					return originCurrency ? originCurrency.coinDenom : denomTrace.denom;
				}

				return `${originCurrency ? originCurrency.coinDenom : denomTrace.denom} (${
					denomTrace.paths.length > 0 ? denomTrace.paths[0].channelId : 'Unknown'
				})`;
			}
		);

		this.layoutStore = new LayoutStore();
	}
}

export function createRootStore() {
	return new RootStore();
}
