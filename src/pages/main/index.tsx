import styled from '@emotion/styled';
import React, { FunctionComponent, ReactNode } from 'react';
import { colorPrimaryDarker } from 'src/emotionStyles/colors';
import { TradeClipboard } from './components/TradeClipboard';
import useWindowSize from 'src/hooks/useWindowSize';

const Background: FunctionComponent = () => {
	const sidebarWidth = 206;

	const { windowSize, isMobileView } = useWindowSize();

	const componentWidth = windowSize.width - sidebarWidth;
	const ratio = componentWidth / windowSize.height;

	/*
	--tradeMinLeft: calc(920 * (100vh / 1080));
	--tradePositionLeft: calc((100vw - 206px) * 0.8 - 520px);
	left: min(var(--tradeMinLeft), var(--tradePositionLeft));
	 */
	const tradeMinLeft = (920 * windowSize.height) / 1080;
	const tradePositionLeft = (windowSize.width - 206) * 0.8 - 520;
	const left = Math.min(tradeMinLeft, tradePositionLeft);

	return (
		<svg
			className="fixed w-full h-full"
			viewBox="0 0 2936 2590"
			height="2590"
			preserveAspectRatio={ratio > 1.1336 ? 'xMinYMid meet' : 'xMidYMid slice'}>
			<g
				transform={
					!isMobileView && windowSize.width > 1280 && left < tradeMinLeft
						? `translate(${((left - tradeMinLeft) * 2590) / windowSize.height})`
						: ''
				}>
				{!isMobileView && ratio > 1.1336 ? (
					<React.Fragment>
						<image
							xlinkHref={require('../../../public/assets/halloween-web.png').default}
							x="0"
							y="0"
							width="3923"
							height="2127"
						/>
						<rect x="-3000" y="2127" width="8660" height="463" fill="#120644" />
						<image
							xlinkHref={require('../../../public/assets/wosmongton-halloween.png').default}
							x="0"
							y="0"
							width="2936"
							height="2590"
						/>
					</React.Fragment>
				) : null}
			</g>
		</svg>
	);
};

export const MainPage: FunctionComponent = () => {
	return (
		<PageContainer>
			<Background />
			<TradeClipboardWrapper>
				<TradeClipboard />
			</TradeClipboardWrapper>
		</PageContainer>
	);
};

const PageContainer = styled.div`
	width: 100%;
	background-color: ${colorPrimaryDarker};
	background-image: url('/public/assets/backgrounds/osmosis-home-bg-pattern.svg');
	background-repeat: repeat-x;
	background-size: cover;
	overflow: auto;
	position: relative;

	@media (max-width: 800px) {
		width: 520px;
	}
`;

function TradeClipboardWrapper({ children }: { children: ReactNode }) {
	const { isMobileView } = useWindowSize();

	return (
		<TradePosition
			style={
				isMobileView
					? {
							justifyContent: 'flex-start',
							paddingTop: '80px',
					  }
					: undefined
			}>
			<TradeContainer>{children}</TradeContainer>
		</TradePosition>
	);
}

const TradePosition = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	position: absolute;
	z-index: 3;
	height: 100%;
	--tradeMinLeft: calc(920 * (100vh / 1080));
	--tradePositionLeft: calc((100vw - 206px) * 0.8 - 520px);
	left: min(var(--tradeMinLeft), var(--tradePositionLeft));
	@media (max-width: 1280px) {
		left: calc((100vw - 520px) / 2);
	}
	@media (max-width: 800px) {
		position: static;
	}
`;

const TradeContainer = styled.div`
	width: 100%;
	max-height: 678px;
`;
