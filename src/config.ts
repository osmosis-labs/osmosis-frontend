import { ChainInfo } from '@keplr-wallet/types';
import { Bech32Address } from '@keplr-wallet/cosmos';

export const PoolsPerPage = 10;
export const RewardEpochIdentifier = 'hourly';

export const IBCAssetInfos: {
	counterpartyChainId: string;
	sourceChannelId: string;
	destChannelId: string;
	coinMinimalDenom: string;
}[] = [
	{
		counterpartyChainId: 'cosmoshub-devnet-1',
		sourceChannelId: 'channel-0',
		destChannelId: 'channel-125',
		coinMinimalDenom: 'uatom',
	},
];

export const EmbedChainInfos: ChainInfo[] = [
	{
		rpc: 'http://a2292001af5254574b9ba6b2de909b5c-481788144.us-east-2.elb.amazonaws.com',
		rest: 'http://a28aae9da1a954e6bbf46b74fb5be1c2-1754577775.us-east-2.elb.amazonaws.com',
		chainId: 'osmosis-devnet-2',
		chainName: 'Osmosis (Dev)',
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
		rpc: 'http://a1b49e433212d46b29712fd009b81751-2133417348.us-east-2.elb.amazonaws.com',
		rest: 'http://a64d7439bb54e425d8712d59b111453c-1520098448.us-east-2.elb.amazonaws.com',
		chainId: 'cosmoshub-devnet-1',
		chainName: 'Cosmos (Dev)',
		stakeCurrency: {
			coinDenom: 'ATOM',
			coinMinimalDenom: 'uatom',
			coinDecimals: 6,
			coinGeckoId: 'cosmos',
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
