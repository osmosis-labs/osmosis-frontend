import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import React, { ComponentProps, CSSProperties, HTMLAttributes, useCallback } from 'react';
import { Img } from 'src/components/common/Img';
import { CenterV } from 'src/components/layouts/Containers';
import { TokenSelectList } from 'src/components/SwapToken/TokenSelect/TokenSelectList';
import { Text, TitleText } from 'src/components/Texts';
import { colorGold, colorTextIcon } from 'src/emotionStyles/colors';

const EMPTY_CURRENCY_LIST: AppCurrency[] = [];

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	value: AppCurrency;
	onSelect: (appCurrency: AppCurrency) => void;
	isDropdownOpen: boolean;
	onDropdownOpen: () => void;
	onDropdownClose: () => void;
	options?: AppCurrency[];
	channelShown?: boolean;
	dropdownStyle?: CSSProperties;
	dropdownClassName?: string;
}

export function TokenSelect({
	value,
	onSelect,
	isDropdownOpen,
	onDropdownClose,
	onDropdownOpen,
	dropdownStyle,
	dropdownClassName,
	options = EMPTY_CURRENCY_LIST,
	channelShown = false,
	...props
}: Props) {
	const handleDropdownArrowClicked = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation();
			if (isDropdownOpen) {
				onDropdownClose();
			} else {
				onDropdownOpen();
			}
		},
		[isDropdownOpen, onDropdownClose, onDropdownOpen]
	);

	const handleTokenSelected = useCallback(
		(appCurrency: AppCurrency) => {
			onSelect(appCurrency);
			onDropdownClose();
		},
		[onDropdownClose, onSelect]
	);

	return (
		<TokenSelectContainer {...props}>
			<TokenImg style={{ marginRight: 12 }} src={value?.coinImageUrl} />
			<CenterV>
				<div>
					<TitleText pb={0}>{value?.coinDenom?.toUpperCase()}</TitleText>
					{channelShown && <ChannelText currency={value} />}
				</div>

				<DownArrowImg onClick={handleDropdownArrowClicked} isActive={options.length === 0 ? false : isDropdownOpen} />
			</CenterV>

			<TokenSelectList
				style={{ ...dropdownStyle, display: !isDropdownOpen ? 'none' : undefined }}
				className={dropdownClassName}
				currencies={options}
				shouldScrollIntoView={isDropdownOpen}
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

function ChannelText({ currency }: { currency: AppCurrency }) {
	const channelId = 'paths' in currency && currency?.paths?.[0]?.channelId;
	if (!channelId) {
		return null;
	}

	return (
		<Text size="sm" style={{ marginTop: 4, color: colorTextIcon }}>
			{channelId}
		</Text>
	);
}

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
