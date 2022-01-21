import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import { IntPretty } from '@keplr-wallet/unit';
import React, { ComponentProps, CSSProperties, HTMLAttributes, MouseEvent, useCallback, useState } from 'react';
import { Img } from 'src/components/common/Img';
import { CenterV } from 'src/components/layouts/Containers';
import { TokenSelectList } from 'src/components/SwapToken/TokenSelect/TokenSelectList';
import { Text } from 'src/components/Texts';
import { colorGold, colorTextIcon } from 'src/emotionStyles/colors';
import useWindowSize from 'src/hooks/useWindowSize';
import { MISC } from 'src/constants';
import cn from 'clsx';

const EMPTY_CURRENCY_LIST: AppCurrency[] = [];

//	TODO : edit how the circle renders the border to make gradients work
const borderImages: Record<string, string> = {
	socialLive: '#89EAFB',
	greenBeach: '#00CEBA',
	kashmir: '#6976FE',
	frost: '#0069C4',
	cherry: '#FF652D',
	sunset: '#FFBC00',
	orangeCoral: '#FF8200',
	pinky: '#FF7A45',
};

interface ExtraAssetInfo {
	index: number;
	coinDenom: string;
	liquidityWeightPercentage: IntPretty;
}

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
	extraAssetInfos?: ExtraAssetInfo[];
	isSearchDisable?: boolean;
	isNoAmountOnList?: boolean;
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
	extraAssetInfos,
	isSearchDisable,
	isNoAmountOnList,
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

	const { isMobileView } = useWindowSize();
	const [isHoveringTokenSelect, setHoveringTokenSelect] = useState(false);
	const isSingleToken = options.length === 1 && options[0].coinDenom === value.coinDenom;

	const extraAssetInfo = extraAssetInfos
		? extraAssetInfos.find(extraAssetInfo => extraAssetInfo.coinDenom === value.coinDenom)
		: null;
	return (
		<TokenSelectContainer {...props}>
			{extraAssetInfo ? (
				<>
					<figure
						style={{ fontSize: isMobileView ? 48 : 60 }}
						className={cn(
							'c100 dark mr-2.5 md:mr-5 flex-shrink-0',
							`p${extraAssetInfo.liquidityWeightPercentage
								.maxDecimals(0)
								.locale(false)
								.toString()}`
						)}>
						<span>{extraAssetInfo.liquidityWeightPercentage.maxDecimals(0).toString()}%</span>
						<div className="slice">
							<div style={{ background: `${borderImages[MISC.GRADIENTS[extraAssetInfo.index]]}` }} className="bar" />
							<div className="fill" />
						</div>
					</figure>

					<CenterV>
						<div>
							<h5 className="text-base md:text-xl text-white-high">{value?.coinDenom?.toUpperCase()}</h5>
							{channelShown && <ChannelText isMobileView={isMobileView} currency={value} />}
						</div>

						{!isSingleToken && (
							<DownArrowImg
								onClick={handleDropdownArrowClicked}
								isActive={options.length === 0 ? false : isDropdownOpen}
								isHovering={isHoveringTokenSelect}
							/>
						)}
					</CenterV>
				</>
			) : (
				<ClickBox
					onClick={handleDropdownArrowClicked}
					onMouseEnter={() => setHoveringTokenSelect(true)}
					onMouseLeave={() => setHoveringTokenSelect(false)}>
					<TokenImg src={value?.coinImageUrl} />
					<div>
						<h5 className="text-base md:text-xl text-white-high">{value?.coinDenom?.toUpperCase()}</h5>
					</div>

					{!isSingleToken && (
						<DownArrowImg
							onClick={handleDropdownArrowClicked}
							isActive={options.length === 0 ? false : isDropdownOpen}
							isHovering={isHoveringTokenSelect}
						/>
					)}
				</ClickBox>
			)}

			{isDropdownOpen && (
				<TokenSelectList
					style={{ ...dropdownStyle, display: !isDropdownOpen ? 'none' : undefined }}
					className={dropdownClassName}
					currencies={options}
					shouldScrollIntoView={isDropdownOpen}
					onSelect={handleTokenSelected}
					extraAssetInfos={extraAssetInfos}
					isSearchDisable={isSearchDisable}
					isNoAmount={isNoAmountOnList}
				/>
			)}
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
			<Img loadingSpin style={{ maxWidth: '44px', maxHeight: '44px', width: '100%', height: '100%' }} {...props} />
		</TokenImgWrapper>
	);
}

const ClickBox = styled(CenterV)`
	cursor: pointer;
`;

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

const DownArrowImg = styled(Img)<{ isActive: boolean; isHovering: boolean }>`
	height: 7px;
	width: 16px;
	margin-left: 8px;
	cursor: pointer;
	opacity: 0.4;
	transition: transform 0.1s;

	${({ isActive }) => ({ transform: isActive ? `rotate(180deg)` : `rotate(0deg)` })}
	${({ isHovering }) => ({ opacity: isHovering ? 1 : 0.4 })}

	@media (min-width: 768px) {
		margin-left: 12px;
		height: 8px;
		width: 18px;
	}
`;
DownArrowImg.defaultProps = { src: '/public/assets/Icons/Down.svg' };
