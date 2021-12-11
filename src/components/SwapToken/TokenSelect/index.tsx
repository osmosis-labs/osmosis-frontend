import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import React, { ComponentProps, CSSProperties, HTMLAttributes, useCallback } from 'react';
import { Img } from 'src/components/common/Img';
import { CenterV } from 'src/components/layouts/Containers';
import { TokenSelectList } from 'src/components/SwapToken/TokenSelect/TokenSelectList';
import { Text, TitleText } from 'src/components/Texts';
import { colorGold, colorTextIcon } from 'src/emotionStyles/colors';
import useWindowSize from 'src/hooks/useWindowSize';

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
		(event: { stopPropagation: () => void }) => {
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

	const { isMobileView } = useWindowSize();

	return (
		<TokenSelectContainer onClick={handleDropdownArrowClicked} {...props}>
			<TokenImg src={value?.coinImageUrl} />
			<CenterV>
				<div>
					<TitleText isMobileView={isMobileView} pb={0}>
						{value?.coinDenom?.toUpperCase()}
					</TitleText>
					{channelShown && <ChannelText isMobileView={isMobileView} currency={value} />}
				</div>

				<DownArrowImg isActive={options.length === 0 ? false : isDropdownOpen} />
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
	cursor: pointer;
`;

function TokenImg({ style, className, ...props }: ComponentProps<typeof Img>) {
	return (
		<TokenImgWrapper style={style} className={className}>
			<Img loadingSpin style={{ maxWidth: '44px', maxHeight: '44px', width: '100%', height: '100%' }} {...props} />
		</TokenImgWrapper>
	);
}

const TokenImgWrapper = styled.figure`
	width: 36px;
	height: 36px;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 50%;
	border: 1px solid ${colorGold};
	padding: 3px;
	margin-right: 8px;
	flex-shrink: 0;

	@media (min-width: 768px) {
		width: 56px;
		height: 56px;
		margin-right: 12px;
		padding: 5px;
	}
`;

function ChannelText({ currency, isMobileView }: { currency: AppCurrency; isMobileView: boolean }) {
	const channelId = 'paths' in currency && currency?.paths?.[0]?.channelId;
	if (!channelId) {
		return null;
	}

	return (
		<Text size="sm" isMobileView={isMobileView} style={{ marginTop: 4, color: colorTextIcon }}>
			{channelId}
		</Text>
	);
}

const DownArrowImg = styled(Img)<{ isActive: boolean }>`
	height: 7px;
	width: 16px;
	margin-left: 8px;
	opacity: 0.4;
	transition: transform 0.1s;

	${({ isActive }) => ({ transform: isActive ? `rotate(180deg)` : `rotate(0deg)` })}
	&:hover {
		opacity: 1;
	}

	@media (min-width: 768px) {
		margin-left: 12px;
		height: 8px;
		width: 18px;
	}
`;
DownArrowImg.defaultProps = { src: '/public/assets/Icons/Down.svg' };
