// TODO : @Thunnini should this data be hard-coded or fetched from somewhere?
export const TOKENS: Record<string, IToken> = {
	eth: {
		LONG_NAME: 'Ethereum',
		// GECKO_ID: 'ethereum',
		DECIMALS: 18,
	},
	atom: {
		LONG_NAME: 'Cosmos',
		// GECKO_ID: 'cosmos',
		DECIMALS: 6,
	},
	iris: {
		LONG_NAME: 'IRISnet',
		DECIMALS: 6,
	},
	akt: {
		LONG_NAME: 'Akash',
		DECIMALS: 6,
	},
	regen: {
		LONG_NAME: 'Regen',
		DECIMALS: 6,
	},
};

// object property === token currency
export interface IToken {
	LONG_NAME: string;
	// GECKO_ID: string;
	DECIMALS: number;
}
