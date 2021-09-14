import { IBCCurrencyRegsitrar, QueriesStore } from '@keplr-wallet/stores';
import { AccountStore } from '@keplr-wallet/stores';
import { DenomHelper, IndexedDBKVStore } from '@keplr-wallet/common';
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
import { BroadcastMode, StdTx } from '@cosmjs/launchpad';
import Axios from 'axios';
import { KeplrWalletConnect } from '@keplr-wallet/wc-client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import WalletConnect from '@walletconnect/client';

let keplr: Keplr | undefined = undefined;
let promise: Promise<Keplr> | undefined = undefined;

async function sendTx(chainId: string, stdTx: StdTx, mode: BroadcastMode): Promise<Uint8Array> {
	const params = {
		tx: stdTx,
		mode,
	};

	const restInstance = Axios.create({
		baseURL: EmbedChainInfos.find(chainInfo => chainInfo.chainId === chainId)!.rest,
	});

	const result = await restInstance.post('/txs', params);

	return Buffer.from(result.data.txhash, 'hex');
}

export function getWCKeplr(): Promise<Keplr> {
	if (keplr) {
		return Promise.resolve(keplr);
	}

	const fn = () => {
		const connector = new WalletConnect({
			bridge: 'https://bridge.walletconnect.org', // Required
			qrcodeModal: QRCodeModal,
		});

		// Check if connection is already established
		if (!connector.connected) {
			// create new session
			connector.createSession();

			return new Promise<Keplr>((resolve, reject) => {
				connector.on('connect', error => {
					if (error) {
						reject(error);
					} else {
						keplr = new KeplrWalletConnect(connector, {
							sendTx,
						});
						resolve(keplr);
					}
				});
			});
		} else {
			keplr = new KeplrWalletConnect(connector, {
				sendTx,
			});
			return Promise.resolve(keplr);
		}
	};

	if (!promise) {
		promise = fn();
	}

	return promise;
}

export class RootStore {
	public readonly chainStore: ChainStore;
	public readonly accountStore: AccountStore<AccountWithCosmosAndOsmosis>;
	public readonly queriesStore: QueriesStore<QueriesWithCosmosAndOsmosis>;
	public readonly priceStore: PoolIntermediatePriceStore;

	public readonly ibcTransferHistoryStore: IBCTransferHistoryStore;

	public readonly swapManager: GammSwapManager;

	protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar<ChainInfoWithExplorer>;
	protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithExplorer>;

	public readonly layoutStore: LayoutStore;

	constructor() {
		this.chainStore = new ChainStore(EmbedChainInfos, EmbedChainInfos[0].chainId);

		this.queriesStore = new QueriesStore(
			new IndexedDBKVStore('store_web_queries'),
			this.chainStore,
			getWCKeplr,
			QueriesWithCosmosAndOsmosis
		);

		this.accountStore = new AccountStore(window, AccountWithCosmosAndOsmosis, this.chainStore, this.queriesStore, {
			defaultOpts: {
				prefetching: false,
				suggestChain: false,
				autoInit: false,
				getKeplr: getWCKeplr,

				msgOpts: {
					ibcTransfer: {
						gas: 650000,
					},
				},

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
		]);

		this.lpCurrencyRegistrar = new LPCurrencyRegistrar(this.chainStore);
		this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar<ChainInfoWithExplorer>(
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
