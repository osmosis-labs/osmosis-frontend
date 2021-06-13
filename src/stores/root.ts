import { CoinGeckoPriceStore, getKeplrFromWindow, IBCCurrencyRegsitrar, QueriesStore } from '@keplr-wallet/stores';
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
import { makeIBCMinimalDenom } from '../utils/ibc';
import { ChainInfoInner } from '@keplr-wallet/stores';

export class RootStore {
	public readonly chainStore: ChainStore;
	public readonly accountStore: AccountStore<AccountWithCosmosAndOsmosis>;
	public readonly queriesStore: QueriesStore<QueriesWithCosmosAndOsmosis>;
	public readonly priceStore: CoinGeckoPriceStore;

	public readonly swapManager: GammSwapManager;

	protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar;
	protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfo>;

	public readonly layoutStore: LayoutStore;

	constructor() {
		this.chainStore = new ChainStore(EmbedChainInfos, 'osmo-testnet-3');

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
			},
			chainOpts: this.chainStore.chainInfos.map((chainInfo: ChainInfo) => {
				return {
					chainId: chainInfo.chainId,
				};
			}),
		});

		this.priceStore = new CoinGeckoPriceStore(new IndexedDBKVStore('store_web_prices'), {
			usd: {
				currency: 'usd',
				symbol: '$',
				maxDecimals: 2,
				locale: 'en-US',
			},
		});

		this.swapManager = new GammSwapManager([
			{
				poolId: '1',
				coinMinimalDenom: 'uosmo',
				coinDenom: 'OSMO',
				coinDecimals: 6,
			},
			{
				poolId: '1',
				coinMinimalDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-0' }], 'uatom'),
				coinDenom: 'ATOM',
				coinDecimals: 6,
				coinGeckoId: 'cosmos',
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
