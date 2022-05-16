export const LAYOUT = {
	SIDEBAR: {
		TRADE: {
			ICON: '/public/assets/Icons/Trade.svg',
			ICON_SELECTED: '/public/assets/Icons/Trade_selected.svg',
			TEXT: 'Trade',
			ROUTE: '/',
			SELECTED_CHECK: '/',
		},
		POOLS: {
			ICON: '/public/assets/Icons/Pool.svg',
			ICON_SELECTED: '/public/assets/Icons/Pool_selected.svg',
			TEXT: 'Pools',
			SELECTED_CHECK: ['/pools', /\/pool\/[0-9]+/],
			ROUTE: '/pools',
		},
		/*
		LBP: {
			ICON: '/public/assets/Icons/LBP.svg',
			ICON_SELECTED: '/public/assets/Icons/LBP_selected.svg',
			TEXT: 'LBP',
			ROUTE: '/bootstrap',
			SELECTED_CHECK: '/bootstrap',
		},
		 */
		/*
		AIRDROP: {
			ICON: '/public/assets/Icons/Airdrop.svg',
			ICON_SELECTED: '/public/assets/Icons/Airdrop_selected.svg',
			TEXT: 'Airdrop',
			ROUTE: '/airdrop',
			SELECTED_CHECK: '/airdrop',
		},
		 */
		ASSETS: {
			ICON: '/public/assets/Icons/Asset.svg',
			ICON_SELECTED: '/public/assets/Icons/Asset_selected.svg',
			TEXT: 'Assets',
			ROUTE: '/assets',
			SELECTED_CHECK: '/assets',
		},
		...(process.env.NODE_ENV === 'production'
			? {
					// Currently, the stake/governace page is not fully implemented yet.
					// So, for now, fallback the stake/governance page to the wallet.keplr.app
					STAKE: {
						ICON: '/public/assets/Icons/Ticket.svg',
						TEXT: 'Stake',
						LINK: 'https://wallet.keplr.app/#/osmosis/stake',
					},
					GOVERNANCE: {
						ICON: '/public/assets/Icons/Vote.svg',
						TEXT: 'Vote',
						LINK: 'https://wallet.keplr.app/#/osmosis/governance',
					},
					STATS: {
						ICON: '/public/assets/Icons/Chart.svg',
						TEXT: 'Stats',
						LINK: 'https://info.osmosis.zone',
					},
			  }
			: {
					GOVERNANCE: {
						ICON: '/public/assets/Icons/Ticket.svg',
						ICON_SELECTED: '/public/assets/Icons/Ticket_selected.svg',
						TEXT: 'Vote',
						ROUTE: '/governance',
						SELECTED_CHECK: [/\/governance[.]?/],
					},
					STATS: {
						ICON: '/public/assets/Icons/Chart.svg',
						TEXT: 'Stats',
						LINK: 'https://info.osmosis.zone',
					},
			  }),
	},
};
export type TSIDEBAR_ITEM = {
	ICON: string;
	ICON_SELECTED: string;
	TEXT: string;
	ROUTE: string;
	SELECTED_CHECK: TSIDEBAR_SELECTED_CHECK;
} & {
	ICON: string;
	TEXT: string;
	LINK: string;
};

export type TSIDEBAR_SELECTED_CHECK = string | (string | RegExp)[];
