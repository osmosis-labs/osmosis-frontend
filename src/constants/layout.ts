export const LAYOUT = {
	SIDEBAR: {
		TRADE: {
			ICON: '/public/assets/Icons/Trade.svg',
			ICON_SELECTED: '/public/assets/Icons/Trade_selected.png',
			TEXT: 'Trade',
			ROUTE: '/',
			SELECTED_CHECK: '/',
		},
		POOLS: {
			ICON: '/public/assets/Icons/Pool.svg',
			ICON_SELECTED: '/public/assets/Icons/Pool_selected.png',
			TEXT: 'Pools',
			SELECTED_CHECK: ['/pools', /\/pool\/[0-9]+/],
			ROUTE: '/pools',
		},
		ASSETS: {
			ICON: '/public/assets/Icons/Trade.svg',
			ICON_SELECTED: '/public/assets/Icons/Trade_selected.png',
			TEXT: 'Assets',
			ROUTE: '/assets',
			SELECTED_CHECK: '/assets',
		},
		GOVERNANCE: {
			ICON: '/public/assets/Icons/Ticket.svg',
			ICON_SELECTED: '/public/assets/Icons/Ticket_selected.png',
			TEXT: 'Governance',
			ROUTE: '/governance',
			SELECTED_CHECK: [/\/governance[.]?/],
		},
		AIRDROP: {
			ICON: '/public/assets/Icons/Airdrop.svg',
			ICON_SELECTED: '/public/assets/Icons/Airdrop_selected.png',
			TEXT: 'Airdrop',
			ROUTE: '/airdrop',
			SELECTED_CHECK: '/airdrop',
		},
	},
};
export interface TSIDEBAR_ITEM {
	ICON: string;
	ICON_SELECTED: string;
	TEXT: string;
	ROUTE: string;
	SELECTED_CHECK: TSIDEBAR_SELECTED_CHECK;
}

export type TSIDEBAR_SELECTED_CHECK = string | (string | RegExp)[];
