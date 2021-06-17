import React, { FunctionComponent, ReactText } from 'react';
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

export type DisplayToastFn = ((
	type: TToastType.TX_BROADCASTING,
	options?: Partial<ToastOptions>
) => ReactText | undefined) &
	((
		type: TToastType.TX_SUCCESSFULL,
		extraData?: Partial<Pick<IToastExtra, 'customLink'>>,
		options?: Partial<ToastOptions>
	) => ReactText | undefined) &
	((
		type: TToastType.TX_FAILED,
		extraData?: Partial<Pick<IToastExtra, 'message'>>,
		options?: Partial<ToastOptions>
	) => ReactText | undefined);

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
	const inputOptions = { ...defaultOptions, ...refinedOptions } as ToastOptions;
	if (type === TToastType.TX_BROADCASTING) {
		return toast(<ToastTxBroadcasting />, inputOptions);
	} else if (type === TToastType.TX_SUCCESSFULL) {
		return toast(<ToastTxSuccess link={inputExtraData.customLink} />, inputOptions);
	} else if (type === TToastType.TX_FAILED) {
		return toast(<ToastTxFailed message={inputExtraData.message} />, inputOptions);
	} else {
		console.error(`Undefined toast type - ${type}`);
	}
};

const ToastTxBroadcasting: FunctionComponent = () => (
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
