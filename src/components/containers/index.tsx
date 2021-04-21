import React, { FunctionComponent, ReactNode } from 'react';
import { ContainerWrapper } from './ContainerWrapper';
import { IContainerSettings, IContainerState, TCardTypes } from '../../interfaces/layout';

export const Container: FunctionComponent<TCardContainerProps> = ({
	children,
	type = TCardTypes.CARD,
	settings = {},
}) => {
	const wrapperClass = getContainerClass(type);
	return (
		<ContainerWrapper
			className={`rounded-md ${wrapperClass}`}
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
	type?: TCardTypes;
	settings?: IContainerSettings;
}
