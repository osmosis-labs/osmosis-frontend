import React, { FunctionComponent } from 'react';
import { Dialog } from '@headlessui/react';

export interface BaseModalProps {
	isOpen: boolean;
	close: () => void;
}

export const BaseDialog: FunctionComponent<BaseModalProps> = ({ isOpen, close, children }) => {
	return (
		<Dialog as="div" className="fixed inset-0 z-100 overflow-y-auto" open={isOpen} onClose={close}>
			<div className="flex items-center justify-center min-h-screen">
				<Dialog.Overlay className="fixed inset-0 bg-black opacity-20 z-0" />

				<div className="min-w-modal p-8 bg-surface shadow-elevation-24dp rounded-2xl z-10">{children}</div>
			</div>
		</Dialog>
	);
};
