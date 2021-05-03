import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { TModal } from '../../interfaces';
import { NewPool } from '../modals/NewPool';

export const ModalContainer: FunctionComponent = observer(() => {
	const { layoutStore } = useStore();

	const content = React.useMemo(() => {
		switch (layoutStore.currentModal) {
			case TModal.INIT:
				return undefined;
			case TModal.NEW_POOL:
				return <NewPool />;
		}
	}, [layoutStore.currentModal]);

	const closeModal = React.useCallback(
		e => {
			// click outside close modal
			e.stopPropagation();
			layoutStore.updateCurrentModal(TModal.INIT);
		},
		[layoutStore]
	);

	return (
		<>
			<div
				onClick={closeModal}
				style={overlayStyle}
				className={cn(
					'w-screen h-screen overflow-hidden z-60',
					layoutStore.currentModal === TModal.INIT ? 'hidden' : 'fixed'
				)}
			/>
			<div className="fixed w-screen h-screen flex justify-center items-center pointer-events-none z-100">
				<div className="pointer-events-auto">{content}</div>
			</div>
		</>
	);
});

const overlayStyle = {
	background: 'rgba(23, 15, 52, 0.8)',
};
