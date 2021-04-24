import React, { FunctionComponent, ReactNode } from 'react';
import cn from 'clsx';
import { ContainerWrapper } from './ContainerWrapper';
import { IContainerSettings, IContainerState, TCardTypes } from '../../interfaces';

export const Container: FunctionComponent<TCardContainerProps> = ({
	className,
	children,
	type = TCardTypes.CARD,
	settings = {},
}) => {
	const containerClass = getContainerClass(type);
	return (
		<ContainerWrapper
			className={cn(containerClass, className)}
			defaultState={IContainerState.SELECTED}
			draggable={settings?.draggable}
			focusable={settings?.focusable}
			hoverable={settings?.hoverable}>
			{children}
		</ContainerWrapper>
	);
};
const getContainerClass = (type: TCardTypes) => {
	if (type === TCardTypes.CARD) return 'bg-card';
	else if (type === TCardTypes.SURFACE) return 'bg-surface';
	else return 'bg-primary-200';
};
interface TCardContainerProps {
	children: ReactNode;
	className?: string;
	type?: TCardTypes;
	settings?: IContainerSettings;
}
