import { getKeplrFromWindow, IBCCurrencyRegsitrar, QueriesStore } from '@keplr-wallet/stores';
import { AccountStore } from '@keplr-wallet/stores';
import { DenomHelper, IndexedDBKVStore } from '@keplr-wallet/common';
import { ChainStore } from './chain';
import { AppCurrency, ChainInfo } from '@keplr-wallet/types';
import { EmbedChainInfos, IBCAssetInfos } from '../config';
import { QueriesWithCosmosAndOsmosis } from './osmosis/query';
import { AccountWithCosmosAndOsmosis } from './osmosis/account';
import { LayoutStore } from './layout';
import { GammSwapManager } from './osmosis/swap';
import { LPCurrencyRegistrar } from './osmosis/currency-registrar';
import { ChainInfoInner } from '@keplr-wallet/stores';
import { PoolIntermediatePriceStore } from './price';
import { Writable } from 'utility-types';

export class RootStore {
	public readonly chainStore: ChainStore;
	public readonly accountStore: AccountStore<AccountWithCosmosAndOsmosis>;
	public readonly queriesStore: QueriesStore<QueriesWithCosmosAndOsmosis>;
	public readonly priceStore: PoolIntermediatePriceStore;

	public readonly swapManager: GammSwapManager;

	protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar;
	protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfo>;

	public readonly layoutStore: LayoutStore;

	constructor() {
		this.chainStore = new ChainStore(EmbedChainInfos, EmbedChainInfos[0].chainId);

		this.queriesStore = new QueriesStore(
			new IndexedDBKVStore('store_web_queries'),
			this.chainStore,
			getKeplrFromWindow,
			QueriesWithCosmosAndOsmosis
		);

		this.accountStore = new AccountStore(window, AccountWithCosmosAndOsmosis, this.chainStore, this.queriesStore, {
			defaultOpts: {
				prefetching: false,
				suggestChain: true,
				autoInit: false,
				getKeplr: getKeplrFromWindow,
				suggestChainFn: async (keplr, chainInfo) => {
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
			chainOpts: this.chainStore.chainInfos.map((chainInfo: ChainInfo) => {
				return {
					chainId: chainInfo.chainId,
				};
			}),
		});

		this.priceStore = new PoolIntermediatePriceStore(
			new IndexedDBKVStore('store_web_prices'),
			{
				usd: {
					currency: 'usd',
					symbol: '$',
					maxDecimals: 2,
					locale: 'en-US',
				},
			},
			this.queriesStore.get(EmbedChainInfos[0].chainId).osmosis.queryGammPools,
			[
				{
					alternativeCoinId: 'pool:uosmo',
					poolId: '4',
					spotPriceSourceDenom: 'uosmo',
					spotPriceDestDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
					destCoinId: 'cosmos',
				},
			]
		);

		this.swapManager = new GammSwapManager([
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
				poolId: '5',
				currencies: [
					{
						coinMinimalDenom: 'uosmo',
						coinDenom: 'OSMO',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
						coinDenom: 'ATOM',
						coinDecimals: 6,
					},
					{
						coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-1' }], 'uiris'),
						coinDenom: 'IRIS',
						coinDecimals: 6,
					},
				],
			},
		]);

		this.lpCurrencyRegistrar = new LPCurrencyRegistrar(this.chainStore);
		this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar<ChainInfo>(
			this.chainStore,
			this.accountStore,
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

				// If the IBC Currency's channel is known.
				// Don't show the channel info on the coin denom.
				const knownAssetInfo = IBCAssetInfos.find(info => info.sourceChannelId === firstPath.channelId);
				if (knownAssetInfo && knownAssetInfo.coinMinimalDenom === denomTrace.denom) {
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
