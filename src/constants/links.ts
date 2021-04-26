export const LINKS = {
	TWITTER: 'https://twitter.com/osmosiszone',
	MEDIUM: 'https://medium.com/@Osmosis',
	// TODO : update to dedicated github resource
	GET_TOKEN_IMG: (token: string): string =>
		`https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/chain_img/${token.toLowerCase()}.png`,
};
