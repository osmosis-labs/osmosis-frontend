import { Bech32Address } from '@keplr-wallet/cosmos';
import { ChainInfoWithExplorer } from './stores/chain';
import { DenomHelper } from '@keplr-wallet/common';
import { Int } from '@keplr-wallet/unit';

export const HideCreateNewPool: boolean = false;
export const HideLBPPoolFromPage: boolean = false;
export const HidePoolFromPage: {
	[poolId: string]: boolean | undefined;
} = {
	/*
	'16': window.location.hostname.startsWith('app.'),
	 */
};

export const LockupAbledPoolIds: {
	[poolId: string]: boolean | undefined;
} = {
	'1': true,
	'2': true,
	'3': true,
	'4': true,
	'5': true,
	'6': true,
	'7': true,
	'8': true,
	'9': true,
	'10': true,
	'13': true,
	'15': true,
	'461': true,
	'482': true,
	'497': true,
	'498': true,
	'548': true,
	'557': true,
	'558': true,
	'571': true,
	'572': true,
	'573': true,
	'574': true,
	'584': true,
	'585': true,
	'592': true,
	'600': true,
	'601': true,
};

export const PromotedLBPPoolIds: {
	poolId: string;
	name: string;
	baseDenom: string;
}[] = [];

export const HideAddLiquidityPoolIds: {
	[poolId: string]: boolean;
} = {
	/*
	'21': window.location.hostname.startsWith('app.'),
	 */
};
export const PreferHeaderShowTokenPricePoolIds: {
	[poolId: string]:
		| {
				baseDenom: string;
		  }
		| undefined;
} = {
	/*
	'21': {
		baseDenom: DenomHelper.ibcDenom([{ portId: 'transfer', channelId: 'channel-8' }], 'uregen'),
	},
	 */
};
export const ExtraGaugeInPool: {
	[poolId: string]:
		| {
				gaugeId: string;
				denom: string;
				extraRewardAmount?: Int;
		  }
		| {
				gaugeId: string;
				denom: string;
				extraRewardAmount?: Int;
		  }[];
} = {
	'461': [
		{
			gaugeId: '1774',
			denom: 'ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59',
		},
		{
			gaugeId: '1775',
			denom: 'ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59',
		},
		{
			gaugeId: '1776',
			denom: 'ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59',
		},
	],
	'482': [
		{
			gaugeId: '1771',
			denom: 'ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59',
		},
		{
			gaugeId: '1772',
			denom: 'ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59',
		},
		{
			gaugeId: '1773',
			denom: 'ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59',
		},
	],
	'497': [
		{
			gaugeId: '1679',
			denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
		},
		{
			gaugeId: '1680',
			denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
		},
		{
			gaugeId: '1681',
			denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
		},
	],
	'498': [
		{
			gaugeId: '1682',
			denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
		},
		{
			gaugeId: '1683',
			denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
		},
		{
			gaugeId: '1684',
			denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
		},
	],
	'548': [
		{
			gaugeId: '1676',
			denom: 'ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59',
		},
		{
			gaugeId: '1677',
			denom: 'ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59',
		},
		{
			gaugeId: '1678',
			denom: 'ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59',
		},
	],
	'557': [
		{
			gaugeId: '1736',
			denom: 'ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B',
		},
	],
	'558': [
		{
			gaugeId: '1737',
			denom: 'ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B',
		},
	],
	'560': [
		{
			gaugeId: '1790',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
		{
			gaugeId: '1792',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
		{
			gaugeId: '1793',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
	],
	'562': [
		{
			gaugeId: '1789',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
		{
			gaugeId: '1791',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
		{
			gaugeId: '1794',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
	],
	'571': [
		{
			gaugeId: '1759',
			denom: 'ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5',
		},
		{
			gaugeId: '1760',
			denom: 'ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5',
		},
		{
			gaugeId: '1761',
			denom: 'ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5',
		},
	],
	'572': [
		{
			gaugeId: '1762',
			denom: 'ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5',
		},
		{
			gaugeId: '1763',
			denom: 'ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5',
		},
		{
			gaugeId: '1764',
			denom: 'ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5',
		},
	],
	'573': [
		{
			gaugeId: '1852',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '1853',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '1854',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
	],
	'574': [
		{
			gaugeId: '1855',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '1856',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '1857',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
	],
	'584': [
		{
			gaugeId: '1861',
			denom: 'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A',
		},
		{
			gaugeId: '1862',
			denom: 'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A',
		},
		{
			gaugeId: '1863',
			denom: 'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A',
		},
	],
	'585': [
		{
			gaugeId: '1864',
			denom: 'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A',
		},
		{
			gaugeId: '1865',
			denom: 'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A',
		},
		{
			gaugeId: '1866',
			denom: 'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A',
		},
	],
	'592': [
		{
			gaugeId: '1858',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '1859',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '1860',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
	],
	'600': [
		{
			gaugeId: '1879',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
		{
			gaugeId: '1880',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
		{
			gaugeId: '1881',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
	],
	'601': [
		{
			gaugeId: '1882',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
		{
			gaugeId: '1883',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
		{
			gaugeId: '1884',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
	],
};

export const PoolsPerPage = 10;
export const RewardEpochIdentifier = 'day';

/**
 * Determine the channel info per the chain.
 * Guide users to use the same channel for convenience.
 */
export const IBCAssetInfos: {
	counterpartyChainId: string;
	// Souce channel id based on the Osmosis chain
	sourceChannelId: string;
	// Destination channel id from Osmosis chain
	destChannelId: string;
	coinMinimalDenom: string;
	// In some reasons, ibc channel is in unstable status.
	// Disable the deposit, withdraw button and show the tooltip.
	isUnstable?: boolean;
}[] = [
	{
		counterpartyChainId: 'cosmoshub-4',
		sourceChannelId: 'channel-0',
		destChannelId: 'channel-141',
		coinMinimalDenom: 'uatom',
	},
	{
		counterpartyChainId: 'columbus-5',
		sourceChannelId: 'channel-72',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'uluna',
	},
	{
		counterpartyChainId: 'crypto-org-chain-mainnet-1',
		sourceChannelId: 'channel-5',
		destChannelId: 'channel-10',
		coinMinimalDenom: 'basecro',
	},
	{
		counterpartyChainId: 'columbus-5',
		sourceChannelId: 'channel-72',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'uusd',
	},
	{
		counterpartyChainId: 'secret-4',
		sourceChannelId: 'channel-88',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'uscrt',
	},
	{
		counterpartyChainId: 'juno-1',
		sourceChannelId: 'channel-42',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'ujuno',
	},
	{
		counterpartyChainId: 'core-1',
		sourceChannelId: 'channel-4',
		destChannelId: 'channel-6',
		coinMinimalDenom: 'uxprt',
	},
	{
		counterpartyChainId: 'columbus-5',
		sourceChannelId: 'channel-72',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'ukrw',
	},
	{
		counterpartyChainId: 'akashnet-2',
		sourceChannelId: 'channel-1',
		destChannelId: 'channel-9',
		coinMinimalDenom: 'uakt',
	},
	{
		counterpartyChainId: 'regen-1',
		sourceChannelId: 'channel-8',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'uregen',
	},
	{
		counterpartyChainId: 'sentinelhub-2',
		sourceChannelId: 'channel-2',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'udvpn',
	},
	{
		counterpartyChainId: 'irishub-1',
		sourceChannelId: 'channel-6',
		destChannelId: 'channel-3',
		coinMinimalDenom: 'uiris',
	},
	{
		counterpartyChainId: 'iov-mainnet-ibc',
		sourceChannelId: 'channel-15',
		destChannelId: 'channel-2',
		coinMinimalDenom: 'uiov',
	},
	{
		counterpartyChainId: 'emoney-3',
		sourceChannelId: 'channel-37',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'ungm',
	},
	{
		counterpartyChainId: 'emoney-3',
		sourceChannelId: 'channel-37',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'eeur',
	},
	{
		counterpartyChainId: 'microtick-1',
		sourceChannelId: 'channel-39',
		destChannelId: 'channel-16',
		coinMinimalDenom: 'utick',
	},
	{
		counterpartyChainId: 'likecoin-mainnet-2',
		sourceChannelId: 'channel-53',
		destChannelId: 'channel-3',
		coinMinimalDenom: 'nanolike',
	},
	{
		counterpartyChainId: 'impacthub-3',
		sourceChannelId: 'channel-38',
		destChannelId: 'channel-4',
		coinMinimalDenom: 'uixo',
	},
	{
		counterpartyChainId: 'bitcanna-1',
		sourceChannelId: 'channel-51',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'ubcna',
	},
	{
		counterpartyChainId: 'bitsong-2b',
		sourceChannelId: 'channel-73',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'ubtsg',
	},
	{
		counterpartyChainId: 'kichain-2',
		sourceChannelId: 'channel-77',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'uxki',
	},
	{
		counterpartyChainId: 'panacea-3',
		sourceChannelId: 'channel-82',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'umed',
	},
	{
		counterpartyChainId: 'bostrom',
		sourceChannelId: 'channel-95',
		destChannelId: 'channel-2',
		coinMinimalDenom: 'boot',
	},
	{
		counterpartyChainId: 'comdex-1',
		sourceChannelId: 'channel-87',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'ucmdx',
	},
];

export const EmbedChainInfos: ChainInfoWithExplorer[] = [
	{
		rpc: 'http://143.198.57.196:26657',
		rest: 'http://143.198.57.196:1317',
		chainId: 'osmosis-testnet-4',
		chainName: 'Osmosis',
		stakeCurrency: {
			coinDenom: 'OSMO',
			coinMinimalDenom: 'uosmo',
			coinDecimals: 6,
			coinGeckoId: 'osmosis',
			coinImageUrl: window.location.origin + '/public/assets/tokens/osmosis.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('osmo'),
		currencies: [
			{
				coinDenom: 'OSMO',
				coinMinimalDenom: 'uosmo',
				coinDecimals: 6,
				coinGeckoId: 'osmosis',
				coinImageUrl: window.location.origin + '/public/assets/tokens/osmosis.svg',
			},
			{
				coinDenom: 'ION',
				coinMinimalDenom: 'uion',
				coinDecimals: 6,
				coinGeckoId: 'ion',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ion.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'OSMO',
				coinMinimalDenom: 'uosmo',
				coinDecimals: 6,
				coinGeckoId: 'osmosis',
				coinImageUrl: window.location.origin + '/public/assets/tokens/osmosis.svg',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://www.mintscan.io/osmosis/txs/{txHash}',
	},
	{
		rpc: 'https://rpc-cosmoshub.keplr.app',
		rest: 'https://lcd-cosmoshub.keplr.app',
		chainId: 'cosmoshub-4',
		chainName: 'Cosmos Hub',
		stakeCurrency: {
			coinDenom: 'ATOM',
			coinMinimalDenom: 'uatom',
			coinDecimals: 6,
			coinGeckoId: 'cosmos',
			coinImageUrl: window.location.origin + '/public/assets/tokens/cosmos.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('cosmos'),
		currencies: [
			{
				coinDenom: 'ATOM',
				coinMinimalDenom: 'uatom',
				coinDecimals: 6,
				coinGeckoId: 'cosmos',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cosmos.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'ATOM',
				coinMinimalDenom: 'uatom',
				coinDecimals: 6,
				coinGeckoId: 'cosmos',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cosmos.svg',
			},
		],
		coinType: 118,
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://www.mintscan.io/cosmos/txs/{txHash}',
	},
	{
		rpc: 'https://rpc-columbus.keplr.app',
		rest: 'https://lcd-columbus.keplr.app',
		chainId: 'columbus-5',
		chainName: 'Terra',
		stakeCurrency: {
			coinDenom: 'LUNA',
			coinMinimalDenom: 'uluna',
			coinDecimals: 6,
			coinGeckoId: 'terra-luna',
			coinImageUrl: window.location.origin + '/public/assets/tokens/luna.png',
		},
		bip44: {
			coinType: 330,
		},
		bech32Config: Bech32Address.defaultBech32Config('terra'),
		currencies: [
			{
				coinDenom: 'LUNA',
				coinMinimalDenom: 'uluna',
				coinDecimals: 6,
				coinGeckoId: 'terra-luna',
				coinImageUrl: window.location.origin + '/public/assets/tokens/luna.png',
			},
			{
				coinDenom: 'UST',
				coinMinimalDenom: 'uusd',
				coinDecimals: 6,
				coinGeckoId: 'terrausd',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ust.png',
			},
			{
				coinDenom: 'KRT',
				coinMinimalDenom: 'ukrw',
				coinDecimals: 6,
				coinGeckoId: 'terra-krw',
				coinImageUrl: window.location.origin + '/public/assets/tokens/krt.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'LUNA',
				coinMinimalDenom: 'uluna',
				coinDecimals: 6,
				coinGeckoId: 'terra-luna',
				coinImageUrl: window.location.origin + '/public/assets/tokens/luna.png',
			},
			{
				coinDenom: 'UST',
				coinMinimalDenom: 'uusd',
				coinDecimals: 6,
				coinGeckoId: 'terrausd',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ust.png',
			},
		],
		gasPriceStep: {
			low: 0.015,
			average: 0.015,
			high: 0.015,
		},
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://finder.terra.money/columbus-5/tx/{txHash}',
	},
	{
		rpc: 'https://rpc-secret.keplr.app',
		rest: 'https://lcd-secret.keplr.app',
		chainId: 'secret-4',
		chainName: 'Secret Network',
		stakeCurrency: {
			coinDenom: 'SCRT',
			coinMinimalDenom: 'uscrt',
			coinDecimals: 6,
			coinGeckoId: 'secret',
			coinImageUrl: window.location.origin + '/public/assets/tokens/scrt.svg',
		},
		bip44: {
			coinType: 529,
		},
		bech32Config: Bech32Address.defaultBech32Config('secret'),
		currencies: [
			{
				coinDenom: 'SCRT',
				coinMinimalDenom: 'uscrt',
				coinDecimals: 6,
				coinGeckoId: 'secret',
				coinImageUrl: window.location.origin + '/public/assets/tokens/scrt.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'SCRT',
				coinMinimalDenom: 'uscrt',
				coinDecimals: 6,
				coinGeckoId: 'secret',
				coinImageUrl: window.location.origin + '/public/assets/tokens/scrt.svg',
			},
		],
		coinType: 118,
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://secretnodes.com/secret/chains/secret-4/transactions/{txHash}',
	},
	{
		rpc: 'https://rpc-akash.keplr.app',
		rest: 'https://lcd-akash.keplr.app',
		chainId: 'akashnet-2',
		chainName: 'Akash',
		stakeCurrency: {
			coinDenom: 'AKT',
			coinMinimalDenom: 'uakt',
			coinDecimals: 6,
			coinGeckoId: 'akash-network',
			coinImageUrl: window.location.origin + '/public/assets/tokens/akt.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('akash'),
		currencies: [
			{
				coinDenom: 'AKT',
				coinMinimalDenom: 'uakt',
				coinDecimals: 6,
				coinGeckoId: 'akash-network',
				coinImageUrl: window.location.origin + '/public/assets/tokens/akt.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'AKT',
				coinMinimalDenom: 'uakt',
				coinDecimals: 6,
				coinGeckoId: 'akash-network',
				coinImageUrl: window.location.origin + '/public/assets/tokens/akt.svg',
			},
		],
		coinType: 118,
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://www.mintscan.io/akash/txs/{txHash}',
	},
	{
		rpc: 'https://rpc-regen.keplr.app',
		rest: 'https://lcd-regen.keplr.app',
		chainId: 'regen-1',
		chainName: 'Regen Network',
		stakeCurrency: {
			coinDenom: 'REGEN',
			coinMinimalDenom: 'uregen',
			coinDecimals: 6,
			coinImageUrl: window.location.origin + '/public/assets/tokens/regen.png',
			coinGeckoId: 'regen',
		},
		bip44: { coinType: 118 },
		bech32Config: Bech32Address.defaultBech32Config('regen'),
		currencies: [
			{
				coinDenom: 'REGEN',
				coinMinimalDenom: 'uregen',
				coinDecimals: 6,
				coinImageUrl: window.location.origin + '/public/assets/tokens/regen.png',
				coinGeckoId: 'regen',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'REGEN',
				coinMinimalDenom: 'uregen',
				coinDecimals: 6,
				coinImageUrl: window.location.origin + '/public/assets/tokens/regen.png',
				coinGeckoId: 'regen',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://regen.aneka.io/txs/{txHash}',
	},
	{
		rpc: 'https://rpc-sentinel.keplr.app',
		rest: 'https://lcd-sentinel.keplr.app',
		chainId: 'sentinelhub-2',
		chainName: 'Sentinel',
		stakeCurrency: {
			coinDenom: 'DVPN',
			coinMinimalDenom: 'udvpn',
			coinDecimals: 6,
			coinGeckoId: 'sentinel',
			coinImageUrl: window.location.origin + '/public/assets/tokens/dvpn.png',
		},
		bip44: { coinType: 118 },
		bech32Config: Bech32Address.defaultBech32Config('sent'),
		currencies: [
			{
				coinDenom: 'DVPN',
				coinMinimalDenom: 'udvpn',
				coinDecimals: 6,
				coinGeckoId: 'sentinel',
				coinImageUrl: window.location.origin + '/public/assets/tokens/dvpn.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'DVPN',
				coinMinimalDenom: 'udvpn',
				coinDecimals: 6,
				coinGeckoId: 'sentinel',
				coinImageUrl: window.location.origin + '/public/assets/tokens/dvpn.png',
			},
		],
		explorerUrlToTx: 'https://www.mintscan.io/sentinel/txs/{txHash}',
		features: ['stargate', 'ibc-transfer'],
	},
	{
		rpc: 'https://rpc-persistence.keplr.app',
		rest: 'https://lcd-persistence.keplr.app',
		chainId: 'core-1',
		chainName: 'Persistence',
		stakeCurrency: {
			coinDenom: 'XPRT',
			coinMinimalDenom: 'uxprt',
			coinDecimals: 6,
			coinGeckoId: 'persistence',
			coinImageUrl: window.location.origin + '/public/assets/tokens/xprt.png',
		},
		bip44: {
			coinType: 750,
		},
		bech32Config: Bech32Address.defaultBech32Config('persistence'),
		currencies: [
			{
				coinDenom: 'XPRT',
				coinMinimalDenom: 'uxprt',
				coinDecimals: 6,
				coinGeckoId: 'persistence',
				coinImageUrl: window.location.origin + '/public/assets/tokens/xprt.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'XPRT',
				coinMinimalDenom: 'uxprt',
				coinDecimals: 6,
				coinGeckoId: 'persistence',
				coinImageUrl: window.location.origin + '/public/assets/tokens/xprt.png',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://www.mintscan.io/persistence/txs/{txHash}',
	},
	{
		rpc: 'https://rpc-iris.keplr.app',
		rest: 'https://lcd-iris.keplr.app',
		chainId: 'irishub-1',
		chainName: 'IRISnet',
		stakeCurrency: {
			coinDenom: 'IRIS',
			coinMinimalDenom: 'uiris',
			coinDecimals: 6,
			coinGeckoId: 'iris-network',
			coinImageUrl: window.location.origin + '/public/assets/tokens/iris.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('iaa'),
		currencies: [
			{
				coinDenom: 'IRIS',
				coinMinimalDenom: 'uiris',
				coinDecimals: 6,
				coinGeckoId: 'iris-network',
				coinImageUrl: window.location.origin + '/public/assets/tokens/iris.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'IRIS',
				coinMinimalDenom: 'uiris',
				coinDecimals: 6,
				coinGeckoId: 'iris-network',
				coinImageUrl: window.location.origin + '/public/assets/tokens/iris.svg',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://www.mintscan.io/iris/txs/{txHash}',
	},
	{
		rpc: 'https://rpc-crypto-org.keplr.app/',
		rest: 'https://lcd-crypto-org.keplr.app/',
		chainId: 'crypto-org-chain-mainnet-1',
		chainName: 'Crypto.org',
		stakeCurrency: {
			coinDenom: 'CRO',
			coinMinimalDenom: 'basecro',
			coinDecimals: 8,
			coinGeckoId: 'crypto-com-chain',
			coinImageUrl: window.location.origin + '/public/assets/tokens/cro.png',
		},
		bip44: {
			coinType: 394,
		},
		bech32Config: Bech32Address.defaultBech32Config('cro'),
		currencies: [
			{
				coinDenom: 'CRO',
				coinMinimalDenom: 'basecro',
				coinDecimals: 8,
				coinGeckoId: 'crypto-com-chain',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cro.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'CRO',
				coinMinimalDenom: 'basecro',
				coinDecimals: 8,
				coinGeckoId: 'crypto-com-chain',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cro.png',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://www.mintscan.io/crypto-org/txs/{txHash}',
	},
	{
		rpc: 'https://rpc-iov.keplr.app',
		rest: 'https://lcd-iov.keplr.app',
		chainId: 'iov-mainnet-ibc',
		chainName: 'Starname',
		stakeCurrency: {
			coinDenom: 'IOV',
			coinMinimalDenom: 'uiov',
			coinDecimals: 6,
			coinGeckoId: 'starname',
			coinImageUrl: window.location.origin + '/public/assets/tokens/iov.png',
		},
		bip44: {
			coinType: 234,
		},
		bech32Config: Bech32Address.defaultBech32Config('star'),
		currencies: [
			{
				coinDenom: 'IOV',
				coinMinimalDenom: 'uiov',
				coinDecimals: 6,
				coinGeckoId: 'starname',
				coinImageUrl: window.location.origin + '/public/assets/tokens/iov.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'IOV',
				coinMinimalDenom: 'uiov',
				coinDecimals: 6,
				coinGeckoId: 'starname',
				coinImageUrl: window.location.origin + '/public/assets/tokens/iov.png',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://www.mintscan.io/starname/txs/{txHash}',
	},
	{
		rpc: 'https://rpc-emoney.keplr.app',
		rest: 'https://lcd-emoney.keplr.app',
		chainId: 'emoney-3',
		chainName: 'e-Money',
		stakeCurrency: {
			coinDenom: 'NGM',
			coinMinimalDenom: 'ungm',
			coinDecimals: 6,
			coinGeckoId: 'e-money',
			coinImageUrl: window.location.origin + '/public/assets/tokens/ngm.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('emoney'),
		currencies: [
			{
				coinDenom: 'NGM',
				coinMinimalDenom: 'ungm',
				coinDecimals: 6,
				coinGeckoId: 'e-money',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ngm.png',
			},
			{
				coinDenom: 'EEUR',
				coinMinimalDenom: 'eeur',
				coinDecimals: 6,
				coinGeckoId: 'e-money-eur',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ngm.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'NGM',
				coinMinimalDenom: 'ungm',
				coinDecimals: 6,
				coinGeckoId: 'e-money',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ngm.png',
			},
		],
		gasPriceStep: {
			low: 1,
			average: 1,
			high: 1,
		},
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://emoney.bigdipper.live/transactions/{txHash}',
	},
	{
		rpc: 'https://rpc-juno.itastakers.com',
		rest: 'https://lcd-juno.itastakers.com',
		chainId: 'juno-1',
		chainName: 'Juno',
		stakeCurrency: {
			coinDenom: 'JUNO',
			coinMinimalDenom: 'ujuno',
			coinDecimals: 6,
			coinGeckoId: 'juno-network',
			coinImageUrl: window.location.origin + '/public/assets/tokens/juno.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('juno'),
		currencies: [
			{
				coinDenom: 'JUNO',
				coinMinimalDenom: 'ujuno',
				coinDecimals: 6,
				coinGeckoId: 'juno-network',
				coinImageUrl: window.location.origin + '/public/assets/tokens/juno.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'JUNO',
				coinMinimalDenom: 'ujuno',
				coinDecimals: 6,
				coinGeckoId: 'juno-network',
				coinImageUrl: window.location.origin + '/public/assets/tokens/juno.svg',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://www.mintscan.io/juno/txs/{txHash}',
	},
	{
		rpc: 'https://rpc-microtick.keplr.app',
		rest: 'https://lcd-microtick.keplr.app',
		chainId: 'microtick-1',
		chainName: 'Microtick',
		stakeCurrency: {
			coinDenom: 'TICK',
			coinMinimalDenom: 'utick',
			coinDecimals: 6,
			coinGeckoId: 'pool:utick',
			coinImageUrl: window.location.origin + '/public/assets/tokens/tick.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('micro'),
		currencies: [
			{
				coinDenom: 'TICK',
				coinMinimalDenom: 'utick',
				coinDecimals: 6,
				coinGeckoId: 'pool:utick',
				coinImageUrl: window.location.origin + '/public/assets/tokens/tick.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'TICK',
				coinMinimalDenom: 'utick',
				coinDecimals: 6,
				coinGeckoId: 'pool:utick',
				coinImageUrl: window.location.origin + '/public/assets/tokens/tick.svg',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://explorer.microtick.zone/transactions/{txHash}',
	},
	{
		rpc: 'https://mainnet-node.like.co/rpc',
		rest: 'https://mainnet-node.like.co',
		chainId: 'likecoin-mainnet-2',
		chainName: 'LikeCoin',
		stakeCurrency: {
			coinDenom: 'LIKE',
			coinMinimalDenom: 'nanolike',
			coinDecimals: 9,
			coinGeckoId: 'likecoin',
			coinImageUrl: window.location.origin + '/public/assets/tokens/likecoin.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('cosmos'),
		currencies: [
			{
				coinDenom: 'LIKE',
				coinMinimalDenom: 'nanolike',
				coinDecimals: 9,
				coinGeckoId: 'likecoin',
				coinImageUrl: window.location.origin + '/public/assets/tokens/likecoin.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'LIKE',
				coinMinimalDenom: 'nanolike',
				coinDecimals: 9,
				coinGeckoId: 'likecoin',
				coinImageUrl: window.location.origin + '/public/assets/tokens/likecoin.svg',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://likecoin.bigdipper.live/transactions/{txHash}',
	},
	{
		rpc: 'https://rpc-impacthub.keplr.app',
		rest: 'https://lcd-impacthub.keplr.app',
		chainId: 'impacthub-3',
		chainName: 'IXO',
		stakeCurrency: {
			coinDenom: 'IXO',
			coinMinimalDenom: 'uixo',
			coinDecimals: 6,
			coinGeckoId: 'pool:uixo',
			coinImageUrl: window.location.origin + '/public/assets/tokens/ixo.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('ixo'),
		currencies: [
			{
				coinDenom: 'IXO',
				coinMinimalDenom: 'uixo',
				coinDecimals: 6,
				coinGeckoId: 'pool:uixo',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ixo.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'IXO',
				coinMinimalDenom: 'uixo',
				coinDecimals: 6,
				coinGeckoId: 'pool:uixo',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ixo.png',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://blockscan.ixo.world/transactions/{txHash}',
	},
	{
		rpc: 'https://rpc.bitcanna.io',
		rest: 'https://lcd.bitcanna.io',
		chainId: 'bitcanna-1',
		chainName: 'BitCanna',
		stakeCurrency: {
			coinDenom: 'BCNA',
			coinMinimalDenom: 'ubcna',
			coinDecimals: 6,
			coinGeckoId: 'bitcanna',
			coinImageUrl: window.location.origin + '/public/assets/tokens/bcna.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('bcna'),
		currencies: [
			{
				coinDenom: 'BCNA',
				coinMinimalDenom: 'ubcna',
				coinDecimals: 6,
				coinGeckoId: 'bitcanna',
				coinImageUrl: window.location.origin + '/public/assets/tokens/bcna.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'BCNA',
				coinMinimalDenom: 'ubcna',
				coinDecimals: 6,
				coinGeckoId: 'bitcanna',
				coinImageUrl: window.location.origin + '/public/assets/tokens/bcna.svg',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://www.mintscan.io/bitcanna/txs/{txHash}',
	},
	{
		rpc: 'https://rpc.explorebitsong.com',
		rest: 'https://lcd.explorebitsong.com',
		chainId: 'bitsong-2b',
		chainName: 'BitSong',
		stakeCurrency: {
			coinDenom: 'BTSG',
			coinMinimalDenom: 'ubtsg',
			coinDecimals: 6,
			coinGeckoId: 'pool:ubtsg',
			coinImageUrl: window.location.origin + '/public/assets/tokens/btsg.svg',
		},
		bip44: {
			coinType: 639,
		},
		bech32Config: Bech32Address.defaultBech32Config('bitsong'),
		currencies: [
			{
				coinDenom: 'BTSG',
				coinMinimalDenom: 'ubtsg',
				coinDecimals: 6,
				coinGeckoId: 'pool:ubtsg',
				coinImageUrl: window.location.origin + '/public/assets/tokens/btsg.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'BTSG',
				coinMinimalDenom: 'ubtsg',
				coinDecimals: 6,
				coinGeckoId: 'pool:ubtsg',
				coinImageUrl: window.location.origin + '/public/assets/tokens/btsg.svg',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://explorebitsong.com/transactions/{txHash}',
	},
	{
		rpc: 'https://rpc-mainnet.blockchain.ki',
		rest: 'https://api-mainnet.blockchain.ki',
		chainId: 'kichain-2',
		chainName: 'Ki',
		stakeCurrency: {
			coinDenom: 'XKI',
			coinMinimalDenom: 'uxki',
			coinDecimals: 6,
			coinGeckoId: 'pool:uxki',
			coinImageUrl: window.location.origin + '/public/assets/tokens/ki.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('ki'),
		currencies: [
			{
				coinDenom: 'XKI',
				coinMinimalDenom: 'uxki',
				coinDecimals: 6,
				coinGeckoId: 'pool:uxki',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ki.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'XKI',
				coinMinimalDenom: 'uxki',
				coinDecimals: 6,
				coinGeckoId: 'pool:uxki',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ki.svg',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://www.mintscan.io/ki-chain/txs/{txHash}',
	},
	{
		rpc: 'https://rpc.gopanacea.org',
		rest: 'https://api.gopanacea.org',
		chainId: 'panacea-3',
		chainName: 'MediBloc',
		stakeCurrency: {
			coinDenom: 'MED',
			coinMinimalDenom: 'umed',
			coinDecimals: 6,
			coinGeckoId: 'medibloc',
			coinImageUrl: window.location.origin + '/public/assets/tokens/med.png',
		},
		bip44: {
			coinType: 371,
		},
		bech32Config: Bech32Address.defaultBech32Config('panacea'),
		currencies: [
			{
				coinDenom: 'MED',
				coinMinimalDenom: 'umed',
				coinDecimals: 6,
				coinGeckoId: 'medibloc',
				coinImageUrl: window.location.origin + '/public/assets/tokens/med.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'MED',
				coinMinimalDenom: 'umed',
				coinDecimals: 6,
				coinGeckoId: 'medibloc',
				coinImageUrl: window.location.origin + '/public/assets/tokens/med.png',
			},
		],
		gasPriceStep: {
			low: 5,
			average: 7,
			high: 9,
		},
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://www.mintscan.io/medibloc/txs/{txHash}',
	},
	{
		rpc: 'https://rpc.bostrom.cybernode.ai',
		rest: 'https://lcd.bostrom.cybernode.ai',
		chainId: 'bostrom',
		chainName: 'Bostrom',
		stakeCurrency: {
			coinDenom: 'BOOT',
			coinMinimalDenom: 'boot',
			coinDecimals: 0,
			// coinGeckoId: 'pool:boot',
			coinImageUrl: window.location.origin + '/public/assets/tokens/boot.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('bostrom'),
		currencies: [
			{
				coinDenom: 'BOOT',
				coinMinimalDenom: 'boot',
				coinDecimals: 0,
				// coinGeckoId: 'pool:boot',
				coinImageUrl: window.location.origin + '/public/assets/tokens/boot.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'BOOT',
				coinMinimalDenom: 'boot',
				coinDecimals: 0,
				// coinGeckoId: 'pool:boot',
				coinImageUrl: window.location.origin + '/public/assets/tokens/boot.png',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://cyb.ai/network/bostrom/tx/{txHash}',
	},
	{
		rpc: 'https://rpc.comdex.one',
		rest: 'https://rest.comdex.one',
		chainId: 'comdex-1',
		chainName: 'Comdex',
		stakeCurrency: {
			coinDenom: 'CMDX',
			coinMinimalDenom: 'ucmdx',
			coinDecimals: 6,
			coinGeckoId: 'pool:ucmdx',
			coinImageUrl: window.location.origin + '/public/assets/tokens/cmdx.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('comdex'),
		currencies: [
			{
				coinDenom: 'CMDX',
				coinMinimalDenom: 'ucmdx',
				coinDecimals: 6,
				coinGeckoId: 'pool:ucmdx',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cmdx.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'CMDX',
				coinMinimalDenom: 'ucmdx',
				coinDecimals: 6,
				coinGeckoId: 'pool:ucmdx',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cmdx.png',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://www.mintscan.io/comdex/txs/{txHash}',
	},
];
