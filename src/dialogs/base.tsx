import React, { FunctionComponent } from 'react';
import { Dialog } from '@headlessui/react';

export interface BaseDialogProps {
	dialogStyle?: Record<string, string>;
	isOpen: boolean;
	close: () => void;
}

// https://github.com/tailwindlabs/headlessui/issues/407
// TODO : has issues with FocusTrap -> fork and fix maybe?
export const BaseDialog: FunctionComponent<BaseDialogProps> = ({ isOpen, close, children, dialogStyle }) => {
	return (
		<React.Fragment>
			{isOpen ? (
				<Dialog as="div" className="fixed inset-0 z-100 overflow-y-auto" open={isOpen} onClose={close}>
					<div className="p-5 md:p-0 flex items-center justify-center min-h-screen">
						<Dialog.Overlay className="fixed inset-0 bg-black opacity-20 z-0" />
						<div
							style={dialogStyle}
							className="relative w-full md:min-w-modal px-4 py-5 md:p-8 bg-surface shadow-elevation-24dp rounded-2xl z-10">
							{children}
							<img
								onClick={() => close()}
								className="absolute cursor-pointer top-4 md:top-6 right-3 md:right-5 w-8 md:w-10"
								src="/public/assets/Icons/Close.svg"
							/>
						</div>
					</div>
				</Dialog>
			) : null}
		</React.Fragment>
	);
};

export function wrapBaseDialog<C extends React.ElementType>(
	element: C
): React.ElementType<BaseDialogProps & React.ComponentProps<C>> {
	// eslint-disable-next-line react/display-name
	return props => {
		return (
			<BaseDialog isOpen={props.isOpen} dialogStyle={props.dialogStyle} close={props.close}>
				{props.isOpen ? React.createElement(element, props) : null}
			</BaseDialog>
		);
	};
}
