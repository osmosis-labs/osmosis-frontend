import { ChainInfo } from '@keplr-wallet/types';
import { Bech32Address } from '@keplr-wallet/cosmos';

export const PoolsPerPage = 10;
export const RewardEpochIdentifier = 'hourly';

export const IBCAssetInfos: {
	counterpartyChainId: string;
	// Souce channel id based on the Osmosis chain
	sourceChannelId: string;
	// Destination channel id from Osmosis chain
	destChannelId: string;
	coinMinimalDenom: string;
}[] = [
	{
		counterpartyChainId: 'cosmoshub-devnet-1',
		sourceChannelId: 'channel-0',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'uatom',
	},
	{
		counterpartyChainId: 'irishub-devnet-1',
		sourceChannelId: 'channel-0',
		destChannelId: 'channel-125',
		coinMinimalDenom: 'uiris',
	},
];

export const EmbedChainInfos: ChainInfo[] = [
	{
		rpc: 'http://a47e6b9368c824b17a6842e04f0e8611-1844060451.us-east-2.elb.amazonaws.com',
		rest: 'http://a5458852b142c491baa62aae9faff1a0-274792033.us-east-2.elb.amazonaws.com',
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
	{
		rpc: 'http://acf37ec0126de49baa9adbfe772c8719-1425539633.us-east-2.elb.amazonaws.com',
		rest: 'http://a037a2456f9cc4fcb9471b3464aa1e67-1456094711.us-east-2.elb.amazonaws.com',
		chainId: 'irishub-devnet-1',
		chainName: 'IRISnet (Dev)',
		stakeCurrency: {
			coinDenom: 'IRIS',
			coinMinimalDenom: 'uiris',
			coinDecimals: 6,
			coinGeckoId: 'iris-network',
		},
		bip44: {
			coinType: 118,
		},
		alternativeBIP44s: [
			{
				coinType: 566,
			},
		],
		bech32Config: Bech32Address.defaultBech32Config('iaa'),
		currencies: [
			{
				coinDenom: 'IRIS',
				coinMinimalDenom: 'uiris',
				coinDecimals: 6,
				coinGeckoId: 'iris-network',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'IRIS',
				coinMinimalDenom: 'uiris',
				coinDecimals: 6,
				coinGeckoId: 'iris-network',
			},
		],
		features: ['stargate', 'ibc-transfer'],
	},
];
