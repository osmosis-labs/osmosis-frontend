import React, { FunctionComponent, ReactComponentElement, ReactElement, ReactNode } from 'react';
import { toast, ToastOptions } from 'react-toastify';

const CloseButton: FunctionComponent<{ closeToast: () => void }> = ({ closeToast }) => (
	<button
		onClick={closeToast}
		style={{ left: '-8px', top: '-8px' }}
		className="hover:opacity-75 absolute z-100 h-6 w-6">
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
	TX_SUCCESSFULL,
	TX_FAILED,
}

interface IToastExtra {
	message: string;
	customLink: string;
}

export const displayToast = (type: TToastType, options?: Partial<ToastOptions>, extraData?: Partial<IToastExtra>) => {
	const refinedOptions = options ? options : {};
	const refinedExtraData = extraData ? extraData : {};
	const inputExtraData = { ...defaultExtraData, ...refinedExtraData } as IToastExtra;
	const inputOptions = { ...defaultOptions, ...refinedOptions } as ToastOptions;
	if (type === TToastType.TX_BROADCASTING) {
		toast(toastTxBroadcasting, inputOptions);
	} else if (type === TToastType.TX_SUCCESSFULL) {
		toast(<ToastTxSuccess link={inputExtraData.customLink} />, inputOptions);
	} else if (type === TToastType.TX_FAILED) {
		toast(<ToastTxFailed message={inputExtraData.message} />, inputOptions);
	} else {
		console.error(`Undefined toast type - ${type}`);
	}
};

// const CloseWrapper: FunctionComponent = ({ children }) => {
// 	return (
// 		<div className="relative pointer-events-none">
// 			<button
// 				style={{ left: '-22px', top: '-28px' }}
// 				className="hover:opacity-75 cursor-pointer absolute rounded-full w-6 h-6 flex items-center justify-center pointer-events-auto">
// 				<img alt="x" className="w-full h-full" src="/public/assets/Icons/ToastClose.png" />
// 			</button>
// 			{children}
// 		</div>
// 	);
// };

const toastTxBroadcasting = (
	<div className="grid gap-3.75" style={{ gridTemplateColumns: '26px 1fr' }}>
		<img
			alt="ldg"
			className="s-spin"
			style={{ width: '26px', height: '26px' }}
			src="/public/assets/Icons/Loading.png"
		/>
		<section className="text-white-high">
			<h6 className="mb-2">Transcation Broadcasting</h6>
			<p className="text-sm">Waiting for transaction to be included in the block</p>
		</section>
	</div>
);

const ToastTxFailed: FunctionComponent<{ message: string }> = ({ message }) => (
	<div className="grid gap-3" style={{ gridTemplateColumns: '32px 1fr' }}>
		<img alt="x" style={{ width: '32px', height: '32px' }} src="/public/assets/Icons/FailedTx.png" />
		<section className="text-white-high">
			<h6 className="mb-2">Transcation Failed</h6>
			<p className="text-sm">{message}</p>
		</section>
	</div>
);

const ToastTxSuccess: FunctionComponent<{ link: string }> = ({ link }) => (
	<div className="grid gap-3.75" style={{ gridTemplateColumns: '32px 1fr' }}>
		<img alt="b" style={{ width: '32px', height: '32px' }} src="/public/assets/Icons/ToastSuccess.png" />
		<section className="text-white-high">
			<h6 className="mb-2">Transcation Successful</h6>
			<a target="__blank" href={link} className="text-sm inline hover:opacity-75 cursor-pointer">
				View explorer <img alt="link" src="/public/assets/Icons/Link.png" className="inline-block h-4 w-4 mb-0.75" />
			</a>
		</section>
	</div>
);
