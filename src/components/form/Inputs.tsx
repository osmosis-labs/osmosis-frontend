import React, { Component, Dispatch, FC, FunctionComponent, HTMLProps, ReactFragment, SetStateAction } from 'react';
import styled from '@emotion/styled';
import { colorWhiteHigh } from 'src/emotionStyles/colors';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';

export const AmountInput = styled.input`
	font-size: 16px;
	color: ${colorWhiteHigh};
	text-align: right;
	&::-webkit-outer-spin-button,
	&::-webkit-inner-spin-button {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		margin: 0;
	}
	width: 100%;
	padding-right: 42px;

	@media (min-width: 768px) {
		font-size: 24px;
		padding-right: 0;
	}
`;

export const SimpleSwitch: FC<{
	checked: boolean;
	onChecked: Dispatch<SetStateAction<boolean>>;
} & HTMLProps<HTMLDivElement>> = ({ checked, onChecked, children, className, ...restProps }) => (
	<div className={clsx(className, 'flex items-center')}>
		<Switch
			checked={checked}
			onChange={onChecked}
			className={clsx(
				checked ? 'bg-primary-200' : 'bg-background',
				'relative inline-flex items-center h-6 rounded-full w-11'
			)}>
			<span
				className={`${
					checked ? 'translate-x-6' : 'translate-x-1'
				} inline-block w-4 h-4 transform bg-white-high rounded-full`}
			/>
		</Switch>
		<span className="p-2">{children}</span>
	</div>
);
