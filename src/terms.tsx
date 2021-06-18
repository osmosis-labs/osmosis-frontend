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
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
			magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
			consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
			Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</TermsDialog>
	);
};
