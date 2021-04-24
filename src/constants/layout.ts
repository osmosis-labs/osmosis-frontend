export const LAYOUT = {
	SIDEBAR: {
		TRADE: {
			ICON: '/public/assets/Icons/Trade.svg',
			ICON_SELECTED: '/public/assets/Icons/Trade_selected.png',
			TEXT: 'Trade',
			ROUTE: '/',
		},
		POOLS: {
			ICON: '/public/assets/Icons/Pool.svg',
			ICON_SELECTED: '/public/assets/Icons/Pool_selected.png',
			TEXT: 'Pools',
			ROUTE: '/pools',
		},
		GOVERNANCE: {
			ICON: '/public/assets/Icons/Ticket.svg',
			ICON_SELECTED: '/public/assets/Icons/Ticket_selected.png',
			TEXT: 'Governance',
			ROUTE: '/governance',
		},
		AIRDROP: {
			ICON: '/public/assets/Icons/Airdrop.svg',
			ICON_SELECTED: '/public/assets/Icons/Airdrop_selected.png',
			TEXT: 'Airdrop',
			ROUTE: '/airdrop',
		},
	},
};
export interface TSIDEBAR_ITEM {
	ICON: string;
	ICON_SELECTED: string;
	TEXT: string;
	ROUTE: string;
}
