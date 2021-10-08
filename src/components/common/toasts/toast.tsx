import React, { FunctionComponent, ReactComponentElement, ReactElement, ReactNode } from 'react';
import { toast, ToastOptions } from 'react-toastify';

const CloseButton: FunctionComponent<{ closeToast: () => void }> = ({ closeToast }) => (
	<button
		onClick={closeToast}
		className="hover:opacity-75 absolute top-2 md:-top-2 right-2 md:-left-2 z-100 h-5 md:h-6 w-5 md:w-6">
		<img alt="x" className="w-full h-full" src="/public/assets/Icons/ToastClose.png" />
	</button>
);

const defaultOptions = {
	position: 'top-right',
	autoClose: 7000,
	hideProgressBar: true,
	closeOnClick: false,
	pauseOnHover: true,
	draggable: false,
	progress: undefined,
	pauseOnFocusLoss: false,
	closeButton: CloseButton,
};

const defaultExtraData = { message: '', customLink: '' };

export enum TToastType {
	TX_BROADCASTING,
	TX_SUCCESSFUL,
	TX_FAILED,
}

interface IToastExtra {
	message: string;
	customLink: string;
}

export type DisplayToastFn = ((type: TToastType.TX_BROADCASTING, options?: Partial<ToastOptions>) => void) &
	((
		type: TToastType.TX_SUCCESSFUL,
		extraData?: Partial<Pick<IToastExtra, 'customLink'>>,
		options?: Partial<ToastOptions>
	) => void) &
	((
		type: TToastType.TX_FAILED,
		extraData?: Partial<Pick<IToastExtra, 'message'>>,
		options?: Partial<ToastOptions>
	) => void);

export interface DisplayToast {
	displayToast: DisplayToastFn;
}

export const displayToast: DisplayToastFn = (
	type: TToastType,
	extraData?: Partial<IToastExtra> | Partial<ToastOptions>,
	options?: Partial<ToastOptions>
) => {
	const refinedOptions = type === TToastType.TX_BROADCASTING ? extraData ?? {} : options ?? {};
	const refinedExtraData = extraData ? extraData : {};
	const inputExtraData = { ...defaultExtraData, ...refinedExtraData } as IToastExtra;
	const inputOptions = {
		...defaultOptions,
		...refinedOptions,
	} as ToastOptions;
	if (type === TToastType.TX_BROADCASTING) {
		toast(<ToastTxBroadcasting />, inputOptions);
	} else if (type === TToastType.TX_SUCCESSFUL) {
		toast(<ToastTxSuccess link={inputExtraData.customLink} />, inputOptions);
	} else if (type === TToastType.TX_FAILED) {
		toast(<ToastTxFailed message={inputExtraData.message} />, inputOptions);
	} else {
		console.error(`Undefined toast type - ${type}`);
	}
};

const ToastTxBroadcasting: FunctionComponent = () => (
	<div className="flex gap-3 md:gap-3.75">
		<img alt="ldg" className="s-spin w-7 h-7" src="/public/assets/Icons/Loading.png" />
		<section className="text-white-high">
			<h6 className="mb-2 text-base md:text-lg">Transaction Broadcasting</h6>
			<p className="text-xs md:text-sm">Waiting for transaction to be included in the block</p>
		</section>
	</div>
);

const ToastTxFailed: FunctionComponent<{ message: string }> = ({ message }) => (
	<div className="flex gap-3 md:gap-3.75">
		<img className="w-8 h-8" alt="x" src="/public/assets/Icons/FailedTx.png" />
		<section className="text-white-high">
			<h6 className="mb-2 text-base md:text-lg">Transaction Failed</h6>
			<p className="text-xs md:text-sm">{message}</p>
		</section>
	</div>
);

const ToastTxSuccess: FunctionComponent<{ link: string }> = ({ link }) => (
	<div className="flex gap-3 md:gap-3.75">
		<img className="w-8 h-8" alt="b" src="/public/assets/Icons/ToastSuccess.png" />
		<section className="text-white-high">
			<h6 className="mb-2 text-base md:text-lg">Transaction Successful</h6>
			<a target="__blank" href={link} className="text-xs md:text-sm inline hover:opacity-75 cursor-pointer">
				View explorer <img alt="link" src="/public/assets/Icons/Link.png" className="inline-block h-4 w-4 mb-0.75" />
			</a>
		</section>
	</div>
);
