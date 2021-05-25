import { ChainInfo } from '@keplr-wallet/types';
import { Bech32Address } from '@keplr-wallet/cosmos';

export const PoolsPerPage = 10;
export const RewardEpochIdentifier = 'daily';

export const IBCAssetInfos: {
	counterpartyChainId: string;
	sourceChannelId: string;
	destChannelId: string;
	coinMinimalDenom: string;
}[] = [
	{
		counterpartyChainId: 'cosmoshub-4',
		sourceChannelId: 'channel-0',
		destChannelId: 'channel-125',
		coinMinimalDenom: 'uatom',
	},
];

export const EmbedChainInfos: ChainInfo[] = [
	{
		rpc: 'http://127.0.0.1:26657',
		rest: 'http://127.0.0.1:1317',
		chainId: 'localnet-1',
		chainName: 'OSMOSIS',
		stakeCurrency: {
			coinDenom: 'OSMO',
			coinMinimalDenom: 'uosmo',
			coinDecimals: 6,
			coinGeckoId: 'cosmos',
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
			},
			{
				coinDenom: 'ATOM',
				coinMinimalDenom: 'uatom',
				coinDecimals: 6,
				coinGeckoId: 'cosmos',
			},
			{
				coinDenom: 'FOO',
				coinMinimalDenom: 'ufoo',
				coinDecimals: 6,
			},
			{
				coinDenom: 'BAR',
				coinMinimalDenom: 'ubar',
				coinDecimals: 6,
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'OSMO',
				coinMinimalDenom: 'uosmo',
				coinDecimals: 6,
			},
		],
		features: ['stargate', 'ibc-transfer'],
	},
	{
		rpc: 'https://rpc-cosmoshub.keplr.app',
		rest: 'https://lcd-cosmoshub.keplr.app',
		chainId: 'cosmoshub-4',
		chainName: 'Cosmos',
		stakeCurrency: {
			coinDenom: 'ATOM',
			coinMinimalDenom: 'uatom',
			coinDecimals: 6,
			coinGeckoId: 'cosmos',
		},
		walletUrl:
			process.env.NODE_ENV === 'production'
				? 'https://wallet.keplr.app/#/cosmoshub/stake'
				: 'http://localhost:8081/#/cosmoshub/stake',
		walletUrlForStaking:
			process.env.NODE_ENV === 'production'
				? 'https://wallet.keplr.app/#/cosmoshub/stake'
				: 'http://localhost:8081/#/cosmoshub/stake',
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
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'ATOM',
				coinMinimalDenom: 'uatom',
				coinDecimals: 6,
				coinGeckoId: 'cosmos',
			},
		],
		coinType: 118,
		features: ['stargate', 'ibc-transfer'],
	},
];
