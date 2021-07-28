import styled from '@emotion/styled';
import React, { FunctionComponent, ReactNode } from 'react';
import ProgressiveImage from 'react-progressive-image';
import { useWindowSize } from 'react-use';
import { colorPrimary } from '../../emotionStyles/colors';
import { TradeClipboard } from './TradeClipboard';

export const MainPage: FunctionComponent = () => {
	return (
		<PageContainer>
			<BgImageContainer />
			<TradeWrapper>
				<TradeClipboard />
			</TradeWrapper>
		</PageContainer>
	);
};

const PageContainer = styled.div`
	width: 100%;
	background-color: ${colorPrimary};
	background-image: url('/public/assets/backgrounds/osmosis-home-bg-pattern.svg');
	background-repeat: repeat-x;
	background-size: cover;
	overflow: scroll;
	height: 100vh;
	position: relative;
	@media (max-width: 780px) {
		width: 520px;
		overflow: hidden;
	}
`;

function TradeWrapper({ children }: { children: ReactNode }) {
	const { height } = useWindowSize();
	return (
		<TradePosition>
			<TradeContainer windowHeight={height}>{children}</TradeContainer>
		</TradePosition>
	);
}

const TradeContainer = styled.div<{ windowHeight?: number }>`
	width: 520px;
	height: 672px;
`;

const TradePosition = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	position: absolute;
	z-index: 3;
	height: 100%;
	--tradePositionLeft: calc(75vh * 193 / 242 + 100px);
	left: min(1100px, var(--tradePositionLeft));
	@media (min-aspect-ratio: 6/4) and (max-height: 880px) {
		left: calc(100vh * 0.62);
	}
	@media (min-aspect-ratio: 6/4) and (max-height: 790px) {
		left: calc(100vh * 0.58);
	}
	@media (min-aspect-ratio: 6/4) and (max-height: 700px) {
		left: calc(100vh * 0.45);
	}
	@media (max-aspect-ratio: 6/4) {
		left: min(calc(95vw - 206px - 540px), 1100px);
	}
	@media (max-width: 780px) {
		position: static;
	}
`;

function BgImageContainer() {
	return (
		<ImageGroupDiv>
			<ProgressiveImage
				placeholder="/public/assets/backgrounds/osmosis-home-bg-low.png"
				src="/public/assets/backgrounds/osmosis-home-bg.png">
				{(src: string) => <ImgBgOsmoGuy src={src} />}
			</ProgressiveImage>
			<OsmoTableDiv />
			<ProgressiveImage
				placeholder="/public/assets/backgrounds/osmosis-home-fg-low.png"
				src="/public/assets/backgrounds/osmosis-home-fg.png">
				{(src: string) => <ImgBgScienceTools src={src} />}
			</ProgressiveImage>
		</ImageGroupDiv>
	);
}

const ImgBgOsmoGuy = styled.div<{ src: string }>`
	background-image: ${({ src }) => `url(${src})`};
	height: 80vh;
	margin-top: -75vh;
	max-width: 1000px;
	background-position: left bottom;
	background-size: contain;
	background-repeat: no-repeat;
	@media (min-aspect-ratio: 6/4) and (max-height: 880px) {
		width: calc(100vh * 0.62);
	}
	@media (min-aspect-ratio: 6/4) and (max-height: 790px) {
		width: calc(100vh * 0.58);
	}
	@media (min-aspect-ratio: 6/4) and (max-height: 700px) {
		width: calc(100vh * 0.45);
	}
	@media (max-aspect-ratio: 6/4) {
		--widthOsmo: calc(88vw - 206px - 540px);
		--heightOsmo: calc(var(--widthOsmo) * 242 / 193);
		width: var(--widthOsmo);
		height: var(--heightOsmo);
		margin-top: calc(var(--heightOsmo) * -0.94);
	}
	@media (max-width: 780px) {
		display: none;
	}
`;

const ImgBgScienceTools = styled.div<{ src: string }>`
	background-image: ${({ src }) => `url(${src})`};
	position: absolute;
	background-position: left bottom;
	background-size: contain;
	background-repeat: no-repeat;
	z-index: 3;
	--heightScienceTools: min(25vh, 500px);
	--widthScienceTools: calc(var(--heightScienceTools) * 1351 / 857);
	width: var(--widthScienceTools);
	height: var(--heightScienceTools);
	bottom: 30%;
	left: 5%;
	@media (min-aspect-ratio: 6/4) and (max-height: 880px) {
		width: calc(100vh * 0.62 * 0.7);
	}
	@media (min-aspect-ratio: 6/4) and (max-height: 790px) {
		width: calc(100vh * 0.58 * 0.7);
	}
	@media (min-aspect-ratio: 6/4) and (max-height: 700px) {
		width: calc(100vh * 0.45 * 0.7);
	}
	@media (max-aspect-ratio: 6/4) {
		--widthOsmo: calc(100vw - 206px - 540px);
		--widthScienceTools: calc(var(--widthOsmo) * 0.7);
		--heightScienceTools: calc(var(--widthScienceTools) * 857 / 1351);
		width: var(--widthScienceTools);
		height: var(--heightScienceTools);
	}
`;

const OsmoTableDiv = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #120644;
	z-index: 1;
`;

const ImageGroupDiv = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: min(20vh, 180px);
	@media (max-aspect-ratio: 5/4) {
		--widthOsmo: calc(100vw - 206px - 540px);
		--heightOsmo: calc(var(--widthOsmo) * 242 / 193);
		height: calc(var(--heightOsmo) * 0.2);
	}
`;
