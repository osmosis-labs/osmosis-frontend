import React, { FunctionComponent, ReactNode } from 'react';
import { IContainerState } from '../../interfaces';
import cn from 'clsx';

export const ContainerWrapper: FunctionComponent<TContainerWrapperProps> = ({
	children,
	className,
	overlayClasses,
	defaultState = IContainerState.ENABLED,
	draggable = false,
	focusable = false,
	hoverable = false,
}) => {
	const [state, setState] = React.useState<IContainerState>(defaultState);
	const [, setTotalState] = React.useState<boolean[]>(defaultTotalState);

	const updateState = React.useCallback((containerState: IContainerState, bool: boolean) => {
		setTotalState(prevState => {
			if (prevState[containerState] === bool) return prevState;

			const newState = [...prevState];
			newState[containerState] = true;
			setState(applyState(newState));
			return newState;
		});
	}, []);

	return (
		<div
			onDragStart={() => {
				if (!draggable) return;
				updateState(IContainerState.DRAG, true);
			}}
			onDragEnd={() => {
				if (!draggable) return;
				updateState(IContainerState.DRAG, false);
			}}
			onFocus={() => {
				if (!focusable) return;
				updateState(IContainerState.FOCUS, true);
			}}
			onBlur={() => {
				if (!focusable) return;
				updateState(IContainerState.FOCUS, false);
			}}
			onMouseEnter={() => {
				if (!hoverable) return;
				updateState(IContainerState.HOVER, true);
			}}
			onMouseLeave={() => {
				if (!hoverable) return;
				updateState(IContainerState.HOVER, false);
			}}
			className={cn('relative w-full h-full', className)}>
			<ContainerOverlay state={state} className={overlayClasses} />
			{children}
		</div>
	);
};

const applyState = (totalState: boolean[]) => {
	if (totalState[IContainerState.DRAG]) return IContainerState.DRAG;
	else if (totalState[IContainerState.SELECTED]) return IContainerState.SELECTED;
	else if (totalState[IContainerState.FOCUS]) return IContainerState.FOCUS;
	else if (totalState[IContainerState.HOVER]) return IContainerState.HOVER;
	return IContainerState.ENABLED;
};

const defaultTotalState = [true, false, false, false, false];

const ContainerOverlay: FunctionComponent<TContainerOverlayProps> = ({ state, className }) => {
	const stateClass = React.useMemo(() => {
		switch (state) {
			case IContainerState.ENABLED:
				return 'bg-transparent';
			case IContainerState.HOVER:
				return 'bg-container-hover';
			case IContainerState.DRAG:
				return 'bg-container-selected shadow-container';
			case IContainerState.FOCUS:
				return 'bg-container-focus text-secondary-200 border-2 border-secondary-200';
			case IContainerState.SELECTED:
				return 'bg-container-selected';
			default:
				return 'bg-transparent';
		}
	}, [state]);
	return <div className={cn('absolute w-full h-full z-0 pointer-events-none', stateClass, className)} />;
};

interface TContainerWrapperProps {
	children: ReactNode;
	className?: string; //	classes that are applied to the container
	overlayClasses?: string; // classes that are applied to the overlay
	defaultState: IContainerState;
	draggable?: boolean;
	focusable?: boolean;
	hoverable?: boolean;
}

interface TContainerOverlayProps {
	state: IContainerState;
	className?: string;
}
