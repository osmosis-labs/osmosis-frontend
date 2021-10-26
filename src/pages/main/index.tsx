import styled from '@emotion/styled';
import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { colorPrimaryDarker } from 'src/emotionStyles/colors';
import { TradeClipboard } from './components/TradeClipboard';
import useWindowSize from 'src/hooks/useWindowSize';

const Background: FunctionComponent = () => {
	const sidebarWidth = 206;
	const [ratio, setRatio] = useState((document.body.clientWidth - sidebarWidth) / document.body.clientHeight);

	useEffect(() => {
		const calcAspectRatio = () => {
			setRatio((document.body.clientWidth - sidebarWidth) / document.body.clientHeight);
		};

		window.addEventListener('resize', calcAspectRatio);

		return () => {
			window.removeEventListener('resize', calcAspectRatio);
		};
	}, []);

	const { isMobileView } = useWindowSize();

	return (
		<svg
			className="absolute w-full h-full"
			viewBox="0 0 2936 2590"
			height="2590"
			preserveAspectRatio={ratio > 1.1336 ? 'xMinYMid meet' : 'xMidYMid slice'}>
			<g>
				{/*
					TODO: 
					<image
						xlinkHref={require('../../../public/assets/halloween-web.png').default}
						x="0"
						y="0"
						width="3923"
						height="2127"
					/>
					 */}
				{!isMobileView ? (
					<React.Fragment>
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
	overflow: scroll;
	height: 100vh;
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
	--tradePositionLeft: calc((100vw - 206px) * 0.8 - 520px);
	left: min(1020px, var(--tradePositionLeft));
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

	@media (min-width: 768px) {
		margin-bottom: 130px;
	}
`;
