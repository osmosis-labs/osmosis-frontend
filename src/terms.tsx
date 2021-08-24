import React, { FunctionComponent, useState } from 'react';
import { TermsDialog } from './dialogs/terms-dialog';

export const Terms: FunctionComponent = () => {
	const [isOpen, setIsOpen] = useState(localStorage.getItem('terms_agreement') == null);

	return (
		<TermsDialog
			title="Before you enter the lab..."
			isOpen={isOpen}
			onAgree={() => {
				setIsOpen(false);
				localStorage.setItem('terms_agreement', 'true');
			}}
			close={() => {
				// noop
				// By dumb way, to prevent closing by clicking the backdrop
				// just do nothing here
			}}>
			Osmosis is a decentralized peer-to-peer blockchain that people can use to create liquidity and trade IBC enabled
			tokens. The Osmosis blockchain is made up of free, public, and open-source software. Your use of Osmosis
			involves various risks, including, but not limited, to losses while digital assets are being supplied to Osmosis
			pools and losses due to the fluctuation of prices of tokens in a trading pair or liquidity pool, including
			Impermanence Loss. Before using any pool on the Osmosis blockchain, you should review the relevant documentation to
			make sure you understand how Osmosis works, and the pool you use on Osmosis works. Additionally, just as you can
			access email protocols, such as SMTP, through multiple email clients, you can access pools on Osmosis through
			several web or mobile interfaces. You are responsible for doing your own diligence on those interfaces to
			understand the fees and risks they present.
			<br />
			<br />
			AS DESCRIBED IN THE OSMOSIS LICENSES, THE OSMOSIS PROTOCOL IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT
			WARRANTIES OF ANY KIND. Although Osmosis Labs Pte. Ltd. ( “Osmosis Labs” ) developed much of the initial code for
			the Osmosis protocol, it does not provide, own, or control the Osmosis protocol, which is run by a decentralized
			validator set. Upgrades and modifications to the protocol are managed in a community-driven way by holders of the
			OSMO governance token. No developer or entity involved in creating the Osmosis protocol will be liable for any
			claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of
			the Osmosis protocol, including any direct, indirect, incidental, special, exemplary, punitive or consequential
			damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
		</TermsDialog>
	);
};
