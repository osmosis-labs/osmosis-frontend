import React, { FunctionComponent, MutableRefObject } from 'react';
import { Dialog, FocusTrap } from '@headlessui/react';

export interface BaseModalProps {
	style?: Record<string, string>;
	isOpen: boolean;
	close: () => void;
}

// https://github.com/tailwindlabs/headlessui/issues/407
// TODO : has issues with FocusTrap -> fork and fix maybe?
export const BaseDialog: FunctionComponent<BaseModalProps> = ({ isOpen, close, children, style }) => {
	return (
		<React.Fragment>
			{isOpen ? (
				<Dialog as="div" className="fixed inset-0 z-100 overflow-y-auto" open={isOpen} onClose={close}>
					<div className="flex items-center justify-center min-h-screen">
						<Dialog.Overlay className="fixed inset-0 bg-black opacity-20 z-0" />
						<div style={style} className="min-w-modal p-8 bg-surface shadow-elevation-24dp rounded-2xl z-10">
							{children}
						</div>
					</div>
				</Dialog>
			) : null}
		</React.Fragment>
	);
};

export const FocusedBaseDialog: FunctionComponent<BaseModalProps> = ({ isOpen, close, children, style }) => {
	const ref = React.useRef<HTMLDivElement | null>(null);
	return (
		<Dialog initialFocus={ref} as="div" className="fixed inset-0 z-100 overflow-y-auto" open={isOpen} onClose={close}>
			<div className="flex items-center justify-center min-h-screen">
				<Dialog.Overlay className="fixed inset-0 bg-black opacity-20 z-0" />
				<div ref={ref} style={style} className="min-w-modal p-8 bg-surface shadow-elevation-24dp rounded-2xl z-10">
					{children}
				</div>
			</div>
		</Dialog>
	);
};
