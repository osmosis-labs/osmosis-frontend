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
	'547': true,
	'548': true,
	'553': true,
	'555': true,
	'557': true,
	'558': true,
	'571': true,
	'572': true,
	'573': true,
	'574': true,
	'577': true,
	'578': true,
	'579': true,
	'584': true,
	'585': true,
	'586': true,
	'587': true,
	'592': true,
	'600': true,
	'601': true,
	'602': true,
	'604': true,
	'611': true,
	'612': true,
	'613': true,
	'617': true,
	'618': true,
	'619': true,
	'621': true,
	'629': true,
	'637': true,
	'638': true,
	'641': true,
	'642': true,
	'643': true,
	'648': true,
	'651': true,
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
	'547': [
		{
			gaugeId: '2021',
			denom: 'ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8',
		},
		{
			gaugeId: '2022',
			denom: 'ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8',
		},
		{
			gaugeId: '2023',
			denom: 'ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8',
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
	'553': [
		{
			gaugeId: '2257',
			denom: 'ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525',
		},
		{
			gaugeId: '2256',
			denom: 'ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525',
		},
		{
			gaugeId: '2255',
			denom: 'ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525',
		},
	],
	'555': [
		{
			gaugeId: '2254',
			denom: 'ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525',
		},
		{
			gaugeId: '2253',
			denom: 'ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525',
		},
		{
			gaugeId: '2252',
			denom: 'ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525',
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
			gaugeId: '1948',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
		{
			gaugeId: '1949',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
		{
			gaugeId: '1950',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
	],
	'562': [
		{
			gaugeId: '1951',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
		{
			gaugeId: '1952',
			denom: 'ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0',
		},
		{
			gaugeId: '1953',
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
			gaugeId: '2030',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '2031',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '2032',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
	],
	'574': [
		{
			gaugeId: '2033',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '2034',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '2035',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
	],
	'577': [
		{
			gaugeId: '2088',
			denom: 'ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E',
		},
		{
			gaugeId: '2089',
			denom: 'ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E',
		},
		{
			gaugeId: '2090',
			denom: 'ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E',
		},
	],
	'578': [
		{
			gaugeId: '2091',
			denom: 'ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E',
		},
		{
			gaugeId: '2092',
			denom: 'ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E',
		},
		{
			gaugeId: '2093',
			denom: 'ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E',
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
	'586': [
		{
			gaugeId: '1885',
			denom: 'ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB',
		},
		{
			gaugeId: '1886',
			denom: 'ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB',
		},
		{
			gaugeId: '1887',
			denom: 'ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB',
		},
	],
	'587': [
		{
			gaugeId: '1888',
			denom: 'ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB',
		},
		{
			gaugeId: '1889',
			denom: 'ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB',
		},
		{
			gaugeId: '1890',
			denom: 'ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB',
		},
	],
	'592': [
		{
			gaugeId: '2036',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '2037',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
		{
			gaugeId: '2038',
			denom: 'ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452',
		},
	],
	'600': [
		{
			gaugeId: '2278',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
		{
			gaugeId: '2279',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
	],
	'601': [
		{
			gaugeId: '2276',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
		{
			gaugeId: '2277',
			denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
		},
	],
	'5': [
		{
			gaugeId: '1900',
			denom: 'ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84',
		},
		{
			gaugeId: '1901',
			denom: 'ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84',
		},
		{
			gaugeId: '1902',
			denom: 'ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84',
		},
	],
	'6': [
		{
			gaugeId: '1903',
			denom: 'ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84',
		},
		{
			gaugeId: '1904',
			denom: 'ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84',
		},
		{
			gaugeId: '1905',
			denom: 'ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84',
		},
	],
	'602': [
		{
			gaugeId: '2127',
			denom: 'ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA',
		},
		{
			gaugeId: '2128',
			denom: 'ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA',
		},
	],
	'604': [
		{
			gaugeId: '1995',
			denom: 'ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4',
		},
		{
			gaugeId: '1996',
			denom: 'ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4',
		},
		{
			gaugeId: '1997',
			denom: 'ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4',
		},
	],
	'605': [
		{
			gaugeId: '1960',
			denom: 'ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228',
		},
		{
			gaugeId: '1961',
			denom: 'ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228',
		},
		{
			gaugeId: '1962',
			denom: 'ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228',
		},
	],
	'606': [
		{
			gaugeId: '1963',
			denom: 'ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228',
		},
		{
			gaugeId: '1964',
			denom: 'ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228',
		},
		{
			gaugeId: '1965',
			denom: 'ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228',
		},
	],
	'611': [
		{
			gaugeId: '1998',
			denom: 'ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4',
		},
		{
			gaugeId: '1999',
			denom: 'ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4',
		},
		{
			gaugeId: '2000',
			denom: 'ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4',
		},
	],
	'612': [
		{
			gaugeId: '2109',
			denom: 'ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293',
		},
	],
	'613': [
		{
			gaugeId: '1982',
			denom: 'ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD',
		},
		{
			gaugeId: '2013',
			denom: 'ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD',
		},
		{
			gaugeId: '2014',
			denom: 'ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD',
		},
	],
	'617': [
		{
			gaugeId: '2125',
			denom: 'ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA',
		},
		{
			gaugeId: '2126',
			denom: 'ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA',
		},
	],
	'618': [
		{
			gaugeId: '2004',
			denom: 'ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C',
		},
		{
			gaugeId: '2005',
			denom: 'ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C',
		},
		{
			gaugeId: '2006',
			denom: 'ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C',
		},
	],
	'619': [
		{
			gaugeId: '2007',
			denom: 'ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C',
		},
		{
			gaugeId: '2008',
			denom: 'ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C',
		},
		{
			gaugeId: '2009',
			denom: 'ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C',
		},
	],
	'621': [
		{
			gaugeId: '2020',
			denom: 'ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D',
		},
	],
	'625': [
		{
			gaugeId: '2511',
			denom: 'ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44',
		},
	],
	'629': [
		{
			gaugeId: '2067',
			denom: 'ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB',
		},
		{
			gaugeId: '2068',
			denom: 'ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB',
		},
		{
			gaugeId: '2069',
			denom: 'ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB',
		},
	],
	'637': [
		{
			gaugeId: '2258',
			denom: 'ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593',
		},
		{
			gaugeId: '2259',
			denom: 'ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593',
		},
		{
			gaugeId: '2260',
			denom: 'ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593',
		},
	],
	'638': [
		{
			gaugeId: '2261',
			denom: 'ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593',
		},
		{
			gaugeId: '2262',
			denom: 'ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593',
		},
		{
			gaugeId: '2263',
			denom: 'ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593',
		},
	],
	'641': [
		{
			gaugeId: '2129',
			denom: 'ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C',
		},
		{
			gaugeId: '2130',
			denom: 'ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C',
		},
		{
			gaugeId: '2131',
			denom: 'ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C',
		},
	],
	'642': [
		{
			gaugeId: '2269',
			denom: 'ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C',
		},
		{
			gaugeId: '2270',
			denom: 'ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C',
		},
		{
			gaugeId: '2271',
			denom: 'ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C',
		},
	],
	'643': [
		{
			gaugeId: '2266',
			denom: 'ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C',
		},
		{
			gaugeId: '2267',
			denom: 'ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C',
		},
		{
			gaugeId: '2268',
			denom: 'ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C',
		},
	],
	'648': [
		{
			gaugeId: '2272',
			denom: 'ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961',
		},
	],
	'651': [
		{
			gaugeId: '2547',
			denom: 'ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3',
		},
		{
			gaugeId: '2548',
			denom: 'ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3',
		},
		{
			gaugeId: '2549',
			denom: 'ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3',
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

	// If the asset is from ics20-cw20
	ics20ContractAddress?: string;

	// If the asset is from ics20-cw20
	ibcTransferPathDenom?: string;
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
		counterpartyChainId: 'juno-1',
		sourceChannelId: 'channel-169',
		destChannelId: 'channel-47',
		coinMinimalDenom: 'cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr',
		ics20ContractAddress: 'juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn',
	},
	{
		counterpartyChainId: 'stargaze-1',
		sourceChannelId: 'channel-75',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'ustars',
	},
	{
		counterpartyChainId: 'chihuahua-1',
		sourceChannelId: 'channel-113',
		destChannelId: 'channel-7',
		coinMinimalDenom: 'uhuahua',
	},
	{
		counterpartyChainId: 'core-1',
		sourceChannelId: 'channel-4',
		destChannelId: 'channel-6',
		coinMinimalDenom: 'uxprt',
	},
	{
		counterpartyChainId: 'core-1',
		sourceChannelId: 'channel-4',
		destChannelId: 'channel-6',
		coinMinimalDenom: 'ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444',
		ibcTransferPathDenom: 'transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006',
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
		counterpartyChainId: 'saage-internal-testnet-1.3',
		sourceChannelId: 'channel-207',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'usaage',
	},
	{
		counterpartyChainId: 'imversed-test-1',
		sourceChannelId: 'channel-221',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'nimv',
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
	{
		counterpartyChainId: 'cheqd-mainnet-1',
		sourceChannelId: 'channel-108',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'ncheq',
	},
	{
		counterpartyChainId: 'lum-network-1',
		sourceChannelId: 'channel-115',
		destChannelId: 'channel-3',
		coinMinimalDenom: 'ulum',
	},
	{
		counterpartyChainId: 'vidulum-1',
		sourceChannelId: 'channel-124',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'uvdl',
	},
	{
		counterpartyChainId: 'desmos-mainnet',
		sourceChannelId: 'channel-135',
		destChannelId: 'channel-2',
		coinMinimalDenom: 'udsm',
	},
	{
		counterpartyChainId: 'dig-1',
		sourceChannelId: 'channel-128',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'udig',
	},
	{
		counterpartyChainId: 'sommelier-3',
		sourceChannelId: 'channel-165',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'usomm',
	},
	{
		counterpartyChainId: 'sifchain-1',
		sourceChannelId: 'channel-47',
		destChannelId: 'channel-17',
		coinMinimalDenom: 'rowan',
	},
	{
		counterpartyChainId: 'laozi-mainnet',
		sourceChannelId: 'channel-148',
		destChannelId: 'channel-83',
		coinMinimalDenom: 'uband',
	},
	{
		counterpartyChainId: 'darchub',
		sourceChannelId: 'channel-171',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'udarc',
	},
	{
		counterpartyChainId: 'umee-1',
		sourceChannelId: 'channel-184',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'uumee',
	},
	{
		counterpartyChainId: 'gravity-bridge-3',
		sourceChannelId: 'channel-144',
		destChannelId: 'channel-10',
		coinMinimalDenom: 'ugraviton',
	},
	{
		counterpartyChainId: 'mainnet-3',
		sourceChannelId: 'channel-181',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'udec',
	},
	{
		counterpartyChainId: 'shentu-2.2',
		sourceChannelId: 'channel-146',
		destChannelId: 'channel-8',
		coinMinimalDenom: 'uctk',
	},
	{
		counterpartyChainId: 'juno-1',
		sourceChannelId: 'channel-169',
		destChannelId: 'channel-47',
		coinMinimalDenom: 'cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl',
		ics20ContractAddress: 'juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn',
	},
	{
		counterpartyChainId: 'carbon-1',
		sourceChannelId: 'channel-188',
		destChannelId: 'channel-0',
		coinMinimalDenom: 'swth',
	},
	{
		counterpartyChainId: 'cerberus-chain-1',
		sourceChannelId: 'channel-212',
		destChannelId: 'channel-1',
		coinMinimalDenom: 'ucrbrus',
	},
	{
		counterpartyChainId: 'juno-1',
		sourceChannelId: 'channel-169',
		destChannelId: 'channel-47',
		coinMinimalDenom: 'cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z',
		ics20ContractAddress: 'juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn',
	},
];

export const EmbedChainInfos: ChainInfoWithExplorer[] = [
	process.env['LOCALNET'] === 'true'
		? {
				rpc: 'http://localhost:26657',
				rest: 'http://localhost:1317',
				chainId: 'localnet-1',
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
					{
						coinDenom: 'ATOM',
						coinMinimalDenom: 'uatom',
						coinDecimals: 6,
						coinGeckoId: 'cosmos',
						coinImageUrl: window.location.origin + '/public/assets/tokens/cosmos.svg',
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
						coinGeckoId: 'osmosis',
						coinImageUrl: window.location.origin + '/public/assets/tokens/osmosis.svg',
					},
				],
				gasPriceStep: {
					low: 0,
					average: 0,
					high: 0.025,
				},
				features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
				explorerUrlToTx: 'https://www.mintscan.io/osmosis/txs/{txHash}',
		  }
		: {
				rpc: 'https://testnet-rpc.osmosis.zone',
				rest: 'https://testnet-rest.osmosis.zone',
				chainId: 'osmo-test-4',
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
				features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
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
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
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
		rpc: 'http://52.202.79.213:26657',
		rest: 'https://sentry.testnet.saage.io:1317',
		chainId: 'saage-internal-testnet-1.3',
		chainName: 'saagetestnet',
		stakeCurrency: {
			coinDenom: 'SGE',
			coinMinimalDenom: 'usaage',
			coinDecimals: 6,
			coinImageUrl: window.location.origin + '/public/assets/tokens/saage.png',
			coinGeckoId: 'pool:usaage',
		},
		bip44: { coinType: 909 },
		bech32Config: Bech32Address.defaultBech32Config('saage'),
		currencies: [
			{
				coinDenom: 'SGE',
				coinMinimalDenom: 'usaage',
				coinDecimals: 6,
				coinImageUrl: window.location.origin + '/public/assets/tokens/saage.png',
				coinGeckoId: 'pool:usaage',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'SGE',
				coinMinimalDenom: 'usaage',
				coinDecimals: 6,
				coinImageUrl: window.location.origin + '/public/assets/tokens/saage.png',
				coinGeckoId: 'pool:usaage',
			},
		],
		gasPriceStep: {
			low: 0.00025,
			average: 0.0025,
			high: 0.025,
		},
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'http://blockexplorer-1.testnet.saage.io/transactions/{txHash}',
	},

	{
		rpc: 'https://tx-endpoint-test.imversed.com:443',
		rest: 'https://query-endpoint-test.imversed.com:443',
		chainId: 'imversed-test-1',
		chainName: 'imversedtestnet',
		stakeCurrency: {
			coinDenom: 'IMV',
			coinMinimalDenom: 'nimv',
			coinDecimals: 6,
			coinImageUrl: window.location.origin + '/public/assets/tokens/imversed.png',
			coinGeckoId: 'imversedtest',
		},
		bip44: { coinType: 118 },
		bech32Config: Bech32Address.defaultBech32Config('imv'),
		currencies: [
			{
				coinDenom: 'IMV',
				coinMinimalDenom: 'nimv',
				coinDecimals: 6,
				coinImageUrl: window.location.origin + '/public/assets/tokens/imversed.png',
				coinGeckoId: 'imversedtest',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'IMV',
				coinMinimalDenom: 'nimv',
				coinDecimals: 6,
				coinImageUrl: window.location.origin + '/public/assets/tokens/imversed.png',
				coinGeckoId: 'imversedtest',
			},
		],
		gasPriceStep: {
			low: 0.00025,
			average: 0.0025,
			high: 0.025,
		},
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://tex-t.imversed.com/transactions/${txHash}',
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
			{
				coinDenom: 'PSTAKE',
				coinMinimalDenom: 'ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444',
				coinDecimals: 18,
				coinGeckoId: 'pstake-finance',
				coinImageUrl: window.location.origin + '/public/assets/tokens/pstake.png',
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
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
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
				coinImageUrl: window.location.origin + '/public/assets/tokens/eeur.png',
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
		rpc: 'https://rpc-juno.keplr.app',
		rest: 'https://lcd-juno.keplr.app',
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
			{
				type: 'cw20',
				contractAddress: 'juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr',
				coinDenom: 'NETA',
				coinMinimalDenom: 'cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr:NETA',
				coinDecimals: 6,
				coinGeckoId: 'neta',
				coinImageUrl: window.location.origin + '/public/assets/tokens/neta.svg',
			},
			{
				type: 'cw20',
				contractAddress: 'juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl',
				coinDenom: 'MARBLE',
				coinMinimalDenom: 'cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl:MARBLE',
				coinDecimals: 3,
				coinGeckoId: 'pool:marble',
				coinImageUrl: window.location.origin + '/public/assets/tokens/marble.svg',
			},
			{
				type: 'cw20',
				contractAddress: 'juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z',
				coinDenom: 'HOPE',
				coinMinimalDenom: 'cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z:HOPE',
				coinDecimals: 6,
				coinGeckoId: 'pool:hope',
				coinImageUrl: window.location.origin + '/public/assets/tokens/hope.svg',
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
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
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
			coinGeckoId: 'comdex',
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
				coinGeckoId: 'comdex',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cmdx.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'CMDX',
				coinMinimalDenom: 'ucmdx',
				coinDecimals: 6,
				coinGeckoId: 'comdex',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cmdx.png',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://www.mintscan.io/comdex/txs/{txHash}',
	},
	{
		rpc: 'https://rpc.cheqd.net',
		rest: 'https://api.cheqd.net',
		chainId: 'cheqd-mainnet-1',
		chainName: 'cheqd',
		stakeCurrency: {
			coinDenom: 'CHEQ',
			coinMinimalDenom: 'ncheq',
			coinDecimals: 9,
			coinGeckoId: 'cheqd-network',
			coinImageUrl: window.location.origin + '/public/assets/tokens/cheq.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('cheqd'),
		currencies: [
			{
				coinDenom: 'CHEQ',
				coinMinimalDenom: 'ncheq',
				coinDecimals: 9,
				coinGeckoId: 'cheqd-network',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cheq.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'CHEQ',
				coinMinimalDenom: 'ncheq',
				coinDecimals: 9,
				coinGeckoId: 'cheqd-network',
				coinImageUrl: window.location.origin + '/public/assets/tokens/cheq.svg',
			},
		],
		gasPriceStep: {
			low: 25,
			average: 30,
			high: 50,
		},
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://explorer.cheqd.io/transactions/{txHash}',
	},
	{
		rpc: 'https://rpc.stargaze-apis.com',
		rest: 'https://rest.stargaze-apis.com',
		chainId: 'stargaze-1',
		chainName: 'Stargaze',
		stakeCurrency: {
			coinDenom: 'STARS',
			coinMinimalDenom: 'ustars',
			coinDecimals: 6,
			coinGeckoId: 'pool:ustars',
			coinImageUrl: window.location.origin + '/public/assets/tokens/stars.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('stars'),
		currencies: [
			{
				coinDenom: 'STARS',
				coinMinimalDenom: 'ustars',
				coinDecimals: 6,
				coinGeckoId: 'pool:ustars',
				coinImageUrl: window.location.origin + '/public/assets/tokens/stars.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'STARS',
				coinMinimalDenom: 'ustars',
				coinDecimals: 6,
				coinGeckoId: 'pool:ustars',
				coinImageUrl: window.location.origin + '/public/assets/tokens/stars.png',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://www.mintscan.io/stargaze/txs/{txHash}',
	},
	{
		rpc: 'https://rpc.chihuahua.wtf',
		rest: 'https://api.chihuahua.wtf',
		chainId: 'chihuahua-1',
		chainName: 'Chihuahua',
		stakeCurrency: {
			coinDenom: 'HUAHUA',
			coinMinimalDenom: 'uhuahua',
			coinDecimals: 6,
			coinGeckoId: 'pool:uhuahua',
			coinImageUrl: window.location.origin + '/public/assets/tokens/huahua.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('chihuahua'),
		currencies: [
			{
				coinDenom: 'HUAHUA',
				coinMinimalDenom: 'uhuahua',
				coinDecimals: 6,
				coinGeckoId: 'pool:uhuahua',
				coinImageUrl: window.location.origin + '/public/assets/tokens/huahua.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'HUAHUA',
				coinMinimalDenom: 'uhuahua',
				coinDecimals: 6,
				coinGeckoId: 'pool:uhuahua',
				coinImageUrl: window.location.origin + '/public/assets/tokens/huahua.png',
			},
		],
		gasPriceStep: {
			low: 0.025,
			average: 0.03,
			high: 0.035,
		},
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://ping.pub/chihuahua/tx/{txHash}',
	},
	{
		rpc: 'https://node0.mainnet.lum.network/rpc',
		rest: 'https://node0.mainnet.lum.network/rest',
		chainId: 'lum-network-1',
		chainName: 'Lum Network',
		stakeCurrency: {
			coinDenom: 'LUM',
			coinMinimalDenom: 'ulum',
			coinDecimals: 6,
			coinGeckoId: 'pool:ulum',
			coinImageUrl: window.location.origin + '/public/assets/tokens/lum.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('lum'),
		currencies: [
			{
				coinDenom: 'LUM',
				coinMinimalDenom: 'ulum',
				coinDecimals: 6,
				coinGeckoId: 'pool:ulum',
				coinImageUrl: window.location.origin + '/public/assets/tokens/lum.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'LUM',
				coinMinimalDenom: 'ulum',
				coinDecimals: 6,
				coinGeckoId: 'pool:ulum',
				coinImageUrl: window.location.origin + '/public/assets/tokens/lum.svg',
			},
		],
		coinType: 118,
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://www.mintscan.io/lum/txs/{txHash}',
	},
	{
		rpc: 'https://mainnet-rpc.vidulum.app',
		rest: 'https://mainnet-lcd.vidulum.app',
		chainId: 'vidulum-1',
		chainName: 'Vidulum',
		stakeCurrency: {
			coinDenom: 'VDL',
			coinMinimalDenom: 'uvdl',
			coinDecimals: 6,
			coinGeckoId: 'vidulum',
			coinImageUrl: window.location.origin + '/public/assets/tokens/vdl.svg',
		},
		bip44: {
			coinType: 370,
		},
		bech32Config: Bech32Address.defaultBech32Config('vdl'),
		currencies: [
			{
				coinDenom: 'VDL',
				coinMinimalDenom: 'uvdl',
				coinDecimals: 6,
				coinGeckoId: 'vidulum',
				coinImageUrl: window.location.origin + '/public/assets/tokens/vdl.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'VDL',
				coinMinimalDenom: 'uvdl',
				coinDecimals: 6,
				coinGeckoId: 'vidulum',
				coinImageUrl: window.location.origin + '/public/assets/tokens/vdl.svg',
			},
		],
		coinType: 370,
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://explorers.vidulum.app/vidulum/tx/{txHash}',
	},
	{
		rpc: 'https://rpc.mainnet.desmos.network',
		rest: 'https://api.mainnet.desmos.network',
		chainId: 'desmos-mainnet',
		chainName: 'Desmos',
		stakeCurrency: {
			coinDenom: 'DSM',
			coinMinimalDenom: 'udsm',
			coinDecimals: 6,
			coinGeckoId: 'pool:udsm',
			coinImageUrl: window.location.origin + '/public/assets/tokens/dsm.svg',
		},
		bip44: {
			coinType: 852,
		},
		bech32Config: Bech32Address.defaultBech32Config('desmos'),
		currencies: [
			{
				coinDenom: 'DSM',
				coinMinimalDenom: 'udsm',
				coinDecimals: 6,
				coinGeckoId: 'pool:udsm',
				coinImageUrl: window.location.origin + '/public/assets/tokens/dsm.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'DSM',
				coinMinimalDenom: 'udsm',
				coinDecimals: 6,
				coinGeckoId: 'pool:udsm',
				coinImageUrl: window.location.origin + '/public/assets/tokens/dsm.svg',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://explorer.desmos.network/transactions/{txHash}',
	},
	{
		rpc: 'https://rpc-1-dig.notional.ventures',
		rest: 'https://api-1-dig.notional.ventures',
		chainId: 'dig-1',
		chainName: 'Dig',
		stakeCurrency: {
			coinDenom: 'DIG',
			coinMinimalDenom: 'udig',
			coinDecimals: 6,
			coinGeckoId: 'pool:udig',
			coinImageUrl: window.location.origin + '/public/assets/tokens/dig.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('dig'),
		currencies: [
			{
				coinDenom: 'DIG',
				coinMinimalDenom: 'udig',
				coinDecimals: 6,
				coinGeckoId: 'pool:udig',
				coinImageUrl: window.location.origin + '/public/assets/tokens/dig.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'DIG',
				coinMinimalDenom: 'udig',
				coinDecimals: 6,
				coinGeckoId: 'pool:udig',
				coinImageUrl: window.location.origin + '/public/assets/tokens/dig.png',
			},
		],
		gasPriceStep: {
			low: 0.025,
			average: 0.03,
			high: 0.035,
		},
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://ping.pub/dig/tx/{txHash}',
	},
	{
		rpc: 'https://rpc-sommelier.keplr.app',
		rest: 'https://lcd-sommelier.keplr.app',
		chainId: 'sommelier-3',
		chainName: 'Sommelier',
		stakeCurrency: {
			coinDenom: 'SOMM',
			coinMinimalDenom: 'usomm',
			coinDecimals: 6,
			coinGeckoId: 'pool:usomm',
			coinImageUrl: window.location.origin + '/public/assets/tokens/somm.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('somm'),
		currencies: [
			{
				coinDenom: 'SOMM',
				coinMinimalDenom: 'usomm',
				coinDecimals: 6,
				coinGeckoId: 'pool:usomm',
				coinImageUrl: window.location.origin + '/public/assets/tokens/somm.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'SOMM',
				coinMinimalDenom: 'usomm',
				coinDecimals: 6,
				coinGeckoId: 'pool:usomm',
				coinImageUrl: window.location.origin + '/public/assets/tokens/somm.png',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://sommscan.io',
	},
	{
		rpc: 'https://rpc.sifchain.finance',
		rest: 'https://api-int.sifchain.finance',
		chainId: 'sifchain-1',
		chainName: 'Sifchain',
		stakeCurrency: {
			coinDenom: 'ROWAN',
			coinMinimalDenom: 'rowan',
			coinDecimals: 18,
			coinGeckoId: 'sifchain',
			coinImageUrl: window.location.origin + '/public/assets/tokens/rowan.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('sif'),
		currencies: [
			{
				coinDenom: 'ROWAN',
				coinMinimalDenom: 'rowan',
				coinDecimals: 18,
				coinGeckoId: 'sifchain',
				coinImageUrl: window.location.origin + '/public/assets/tokens/rowan.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'ROWAN',
				coinMinimalDenom: 'rowan',
				coinDecimals: 18,
				coinGeckoId: 'sifchain',
				coinImageUrl: window.location.origin + '/public/assets/tokens/rowan.svg',
			},
		],
		features: ['stargate', 'ibc-transfer'],
		explorerUrlToTx: 'https://www.mintscan.io/sifchain/txs/{txHash}',
	},
	{
		rpc: 'https://rpc.laozi3.bandchain.org',
		rest: 'https://laozi1.bandchain.org/api',
		chainId: 'laozi-mainnet',
		chainName: 'BandChain',
		stakeCurrency: {
			coinDenom: 'BAND',
			coinMinimalDenom: 'uband',
			coinDecimals: 6,
			coinGeckoId: 'band-protocol',
			coinImageUrl: window.location.origin + '/public/assets/tokens/band.svg',
		},
		bip44: {
			coinType: 494,
		},
		bech32Config: Bech32Address.defaultBech32Config('band'),
		currencies: [
			{
				coinDenom: 'BAND',
				coinMinimalDenom: 'uband',
				coinDecimals: 6,
				coinGeckoId: 'band-protocol',
				coinImageUrl: window.location.origin + '/public/assets/tokens/band.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'BAND',
				coinMinimalDenom: 'uband',
				coinDecimals: 6,
				coinGeckoId: 'band-protocol',
				coinImageUrl: window.location.origin + '/public/assets/tokens/band.svg',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://cosmoscan.io/tx/{txHash}',
	},
	{
		rpc: 'https://node1.konstellation.tech:26657',
		rest: 'https://node1.konstellation.tech:1318',
		chainId: 'darchub',
		chainName: 'Konstellation',
		stakeCurrency: {
			coinDenom: 'DARC',
			coinMinimalDenom: 'udarc',
			coinDecimals: 6,
			coinGeckoId: 'pool:udarc',
			coinImageUrl: window.location.origin + '/public/assets/tokens/darc.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('darc'),
		currencies: [
			{
				coinDenom: 'DARC',
				coinMinimalDenom: 'udarc',
				coinDecimals: 6,
				coinGeckoId: 'pool:udarc',
				coinImageUrl: window.location.origin + '/public/assets/tokens/darc.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'DARC',
				coinMinimalDenom: 'udarc',
				coinDecimals: 6,
				coinGeckoId: 'pool:udarc',
				coinImageUrl: window.location.origin + '/public/assets/tokens/darc.svg',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://www.mintscan.io/konstellation/txs/{txHash}',
	},
	{
		rpc: 'https://rpc.aphrodite.main.network.umee.cc',
		rest: 'https://api.aphrodite.main.network.umee.cc',
		chainId: 'umee-1',
		chainName: 'Umee',
		stakeCurrency: {
			coinDenom: 'UMEE',
			coinMinimalDenom: 'uumee',
			coinDecimals: 6,
			coinGeckoId: 'pool:uumee',
			coinImageUrl: window.location.origin + '/public/assets/tokens/umee.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('umee'),
		currencies: [
			{
				coinDenom: 'UMEE',
				coinMinimalDenom: 'uumee',
				coinDecimals: 6,
				coinGeckoId: 'pool:uumee',
				coinImageUrl: window.location.origin + '/public/assets/tokens/umee.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'UMEE',
				coinMinimalDenom: 'uumee',
				coinDecimals: 6,
				coinGeckoId: 'pool:uumee',
				coinImageUrl: window.location.origin + '/public/assets/tokens/umee.png',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://www.mintscan.io/umee/txs/{txHash}',
	},
	{
		rpc: 'https://gravitychain.io:26657',
		rest: 'https://gravitychain.io:1317',
		chainId: 'gravity-bridge-3',
		chainName: 'Gravity Bridge',
		stakeCurrency: {
			coinDenom: 'GRAV',
			coinMinimalDenom: 'ugraviton',
			coinDecimals: 6,
			coinGeckoId: 'pool:ugraviton',
			coinImageUrl: window.location.origin + '/public/assets/tokens/grav.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('gravity'),
		currencies: [
			{
				coinDenom: 'GRAV',
				coinMinimalDenom: 'ugraviton',
				coinDecimals: 6,
				coinGeckoId: 'pool:ugraviton',
				coinImageUrl: window.location.origin + '/public/assets/tokens/grav.svg',
			},
			{
				coinDenom: 'PSTAKE',
				coinMinimalDenom: 'gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006',
				coinDecimals: 18,
				coinGeckoId: 'pstake-finance',
				coinImageUrl: window.location.origin + '/public/assets/tokens/pstake.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'GRAV',
				coinMinimalDenom: 'ugraviton',
				coinDecimals: 6,
				coinGeckoId: 'pool:ugraviton',
				coinImageUrl: window.location.origin + '/public/assets/tokens/grav.svg',
			},
		],
		gasPriceStep: {
			low: 0,
			average: 0,
			high: 0.035,
		},
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://www.mintscan.io/gravity-bridge/txs/{txHash}',
	},
	{
		rpc: 'https://poseidon.mainnet.decentr.xyz',
		rest: 'https://rest.mainnet.decentr.xyz',
		chainId: 'mainnet-3',
		chainName: 'Decentr',
		stakeCurrency: {
			coinDenom: 'DEC',
			coinMinimalDenom: 'udec',
			coinDecimals: 6,
			coinGeckoId: 'decentr',
			coinImageUrl: window.location.origin + '/public/assets/tokens/dec.svg',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('decentr'),
		currencies: [
			{
				coinDenom: 'DEC',
				coinMinimalDenom: 'udec',
				coinDecimals: 6,
				coinGeckoId: 'decentr',
				coinImageUrl: window.location.origin + '/public/assets/tokens/dec.svg',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'DEC',
				coinMinimalDenom: 'udec',
				coinDecimals: 6,
				coinGeckoId: 'decentr',
				coinImageUrl: window.location.origin + '/public/assets/tokens/dec.svg',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
		explorerUrlToTx: 'https://explorer.decentr.net/transactions/{txHash}?networkId=mainnet',
	},
	{
		rpc: 'https://shenturpc.certikpowered.info',
		rest: 'https://azuredragon.noopsbycertik.com',
		chainId: 'shentu-2.2',
		chainName: 'Certik',
		stakeCurrency: {
			coinDenom: 'CTK',
			coinMinimalDenom: 'uctk',
			coinDecimals: 6,
			coinGeckoId: 'certik',
			coinImageUrl: window.location.origin + '/public/assets/tokens/ctk.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('certik'),
		currencies: [
			{
				coinDenom: 'CTK',
				coinMinimalDenom: 'uctk',
				coinDecimals: 6,
				coinGeckoId: 'certik',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ctk.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'CTK',
				coinMinimalDenom: 'uctk',
				coinDecimals: 6,
				coinGeckoId: 'certik',
				coinImageUrl: window.location.origin + '/public/assets/tokens/ctk.png',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://www.mintscan.io/certik/txs/{txHash}',
	},
	{
		rpc: 'https://rpc.cerberus.zone:26657',
		rest: 'https://api.cerberus.zone:1317',
		chainId: 'cerberus-chain-1',
		chainName: 'Cerberus',
		stakeCurrency: {
			coinDenom: 'CRBRUS',
			coinMinimalDenom: 'ucrbrus',
			coinDecimals: 6,
			coinGeckoId: 'cerberus',
			coinImageUrl: window.location.origin + '/public/assets/tokens/crbrus.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('cerberus'),
		currencies: [
			{
				coinDenom: 'CRBRUS',
				coinMinimalDenom: 'ucrbrus',
				coinDecimals: 6,
				coinGeckoId: 'cerberus',
				coinImageUrl: window.location.origin + '/public/assets/tokens/crbrus.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'CRBRUS',
				coinMinimalDenom: 'ucrbrus',
				coinDecimals: 6,
				coinGeckoId: 'pool:crbrus',
				coinImageUrl: window.location.origin + '/public/assets/tokens/crbrus.png',
			},
		],
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://skynetexplorers.com/Cerberus/tx/{txHash}',
	},
	{
		rpc: 'https://tm-api.carbon.network',
		rest: 'https://api.carbon.network',
		chainId: 'carbon-1',
		chainName: 'Carbon',
		stakeCurrency: {
			coinDenom: 'SWTH',
			coinMinimalDenom: 'swth',
			coinDecimals: 8,
			coinGeckoId: 'switcheo',
			coinImageUrl: window.location.origin + '/public/assets/tokens/swth.png',
		},
		bip44: {
			coinType: 118,
		},
		bech32Config: Bech32Address.defaultBech32Config('swth'),
		currencies: [
			{
				coinDenom: 'SWTH',
				coinMinimalDenom: 'swth',
				coinDecimals: 8,
				coinGeckoId: 'switcheo',
				coinImageUrl: window.location.origin + '/public/assets/tokens/swth.png',
			},
		],
		feeCurrencies: [
			{
				coinDenom: 'SWTH',
				coinMinimalDenom: 'swth',
				coinDecimals: 8,
				coinGeckoId: 'switcheo',
				coinImageUrl: window.location.origin + '/public/assets/tokens/swth.png',
			},
		],
		gasPriceStep: {
			low: 769.23077,
			average: 769.23077,
			high: 769.23077,
		},
		features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
		explorerUrlToTx: 'https://scan.carbon.network/transaction/{txHash}?net=main',
	},
];
