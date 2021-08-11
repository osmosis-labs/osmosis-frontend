import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import React, { ComponentProps, CSSProperties, HTMLAttributes, useCallback, useState } from 'react';
import { Img } from 'src/components/common/Img';
import { CenterV } from 'src/components/layouts/Containers';
import { TokenSelectList } from 'src/components/SwapToken/TokenSelect/TokenSelectList';
import { TitleText } from 'src/components/Texts';
import { colorGold } from 'src/emotionStyles/colors';
import { useBooleanStateWithWindowEvent } from 'src/hooks/useBooleanStateWithWindowEvent';

const EMPTY_CURRENCY_LIST: AppCurrency[] = [];

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	defaultSelectedCurrency: AppCurrency;
	options?: AppCurrency[];
	onSelect?: (appCurrency: AppCurrency) => void;
	dropdownStyle?: CSSProperties;
	dropdownClassname?: string;
}

export function TokenSelect({
	defaultSelectedCurrency,
	options = EMPTY_CURRENCY_LIST,
	onSelect,
	dropdownStyle,
	dropdownClassname,
	...props
}: Props) {
	const [isDropdownOpen, setIsDropdownOpen] = useBooleanStateWithWindowEvent(false);
	const [selectedCurrency, setSelectedCurrency] = useState(defaultSelectedCurrency);

	const handleDropdownArrowClicked = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation();
			setIsDropdownOpen(v => !v);
		},
		[setIsDropdownOpen]
	);

	const handleTokenSelected = useCallback(
		(appCurrency: AppCurrency) => {
			onSelect?.(appCurrency);
			setSelectedCurrency(appCurrency);
			setIsDropdownOpen(false);
		},
		[onSelect, setIsDropdownOpen]
	);

	return (
		<TokenSelectContainer {...props}>
			<TokenImg style={{ marginRight: 12 }} src={selectedCurrency.coinImageUrl} />
			<CenterV>
				<TitleText pb={0}>{selectedCurrency.coinDenom?.toUpperCase()}</TitleText>
				<DownArrowImg onClick={handleDropdownArrowClicked} isActive={options.length === 0 ? false : isDropdownOpen} />
			</CenterV>

			<TokenSelectList
				style={{ ...dropdownStyle, display: !isDropdownOpen ? 'none' : undefined }}
				className={dropdownClassname}
				currencies={options}
				onSelect={handleTokenSelected}
			/>
		</TokenSelectContainer>
	);
}

const TokenSelectContainer = styled.div`
	display: flex;
	align-items: center;
	position: relative;
`;

function TokenImg({ style, className, ...props }: ComponentProps<typeof Img>) {
	return (
		<TokenImgWrapper style={style} className={className}>
			<Img loadingSpin style={{ width: '44px', height: '44px' }} {...props} />
		</TokenImgWrapper>
	);
}

const TokenImgWrapper = styled.figure`
	width: 56px;
	height: 56px;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 9999px;
	border: 1px solid ${colorGold};
`;

const DownArrowImg = styled(Img)<{ isActive: boolean }>`
	height: 1.5rem;
	width: 2rem;
	margin-left: 4px;
	padding: 8px;
	cursor: pointer;
	opacity: 0.4;
	transition: transform 0.1s;

	${({ isActive }) => ({ transform: isActive ? `rotate(180deg)` : `rotate(0deg)` })}
	&:hover {
		opacity: 1;
	}
`;
DownArrowImg.defaultProps = { src: '/public/assets/Icons/Down.svg' };
