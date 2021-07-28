import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React, { FunctionComponent, ReactNode } from 'react';
import ProgressiveImage from 'react-progressive-image';
import { useWindowSize } from 'react-use';
import { colorPrimary } from '../../emotionStyles/colors';
import { onLWidth, onMWidth, onSWidth, onXlWidth, onXsWidth } from '../../emotionStyles/mediaQueries';
import { TradeClipboard } from './TradeClipboard';

const TOOL_TABLE_HEIGHT = 180;

interface WindowSizeProps {
	windowWidth?: number;
	windowHeight?: number;
}

export const MainPage: FunctionComponent = () => {
	const { width, height } = useWindowSize();
	return (
		<PageContainer>
			<BgImageContainer windowWidth={width} windowHeight={height} />
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
	height: 100vh;
	position: relative;
`;

function TradeWrapper({ children }: { children: ReactNode }) {
	const { height } = useWindowSize();
	return (
		<TradePosition>
			<TradeContainer windowHeight={height}>{children}</TradeContainer>
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
	left: 1200px;
	height: 100%;

	${onXlWidth} {
		left: initial;
		right: 80px;
	}

	${onLWidth} {
		right: 20px;
	}

	${onSWidth} {
		right: initial;
		left: 180px;
	}

	${onXsWidth} {
		left: 20px;
	}
`;

const TradeContainer = styled.div<{ windowHeight?: number }>`
	${({ windowHeight = 0 }) => ({
		marginBottom: windowHeight < 760 ? 0 : 130,
	})};
	width: 520px;
	height: 672px;

	${onXsWidth} {
		width: 500px;
	}
`;

function BgImageContainer({ windowHeight, windowWidth }: WindowSizeProps) {
	return (
		<>
			<ProgressiveImage
				placeholder="/public/assets/backgrounds/osmosis-home-bg-low.png"
				src="/public/assets/backgrounds/osmosis-home-bg.png">
				{(src: string) => (
					<ImgOsmoGuy windowHeight={windowHeight} windowWidth={windowWidth} src={src} alt="Osmosis guy" />
				)}
			</ProgressiveImage>
			<ProgressiveImage
				placeholder="/public/assets/backgrounds/osmosis-home-fg-low.png"
				src="/public/assets/backgrounds/osmosis-home-fg.png">
				{(src: string) => <ImgScienceTools src={src} alt="Osmosis science tools" />}
			</ProgressiveImage>
			<StyledBottomDiv />
		</>
	);
}

const osmoGuyCssWidthRules = css`
	${onLWidth} {
		width: 740px;
		left: 10px;
		bottom: ${TOOL_TABLE_HEIGHT - 30}px;
	}

	${onMWidth} {
		width: 600px;
		left: 10px;
		bottom: ${TOOL_TABLE_HEIGHT - 38}px;
	}
`;
const ImgOsmoGuy = styled.img<{ windowWidth?: number; windowHeight?: number }>`
	display: block;
	position: absolute;
	bottom: ${TOOL_TABLE_HEIGHT - 66}px;
	left: 84px;
	z-index: 0;
	width: 860px;
	height: auto;
	${({ windowHeight = 0, windowWidth = 0 }) => {
		const MAX_IMAGE_HEIGHT = 800;
		const ASPECT_RATIO = [193, 242];
		const MEDIUM_WINDOW_WIDTH = 1390;

		if (windowWidth <= windowHeight) {
			return osmoGuyCssWidthRules;
		} else if (windowHeight < windowWidth) {
			const imageHeight = Math.min(Math.floor(windowHeight * 0.8), MAX_IMAGE_HEIGHT);
			const imageWidth = Math.floor((imageHeight * ASPECT_RATIO[0]) / ASPECT_RATIO[1]);

			if (imageHeight === MAX_IMAGE_HEIGHT && windowWidth < MEDIUM_WINDOW_WIDTH) {
				return osmoGuyCssWidthRules;
			}
			return css`
				height: ${imageHeight}px;
				width: ${imageWidth}px;
			`;
		}
	}}
`;

const ImgScienceTools = styled.img`
	display: block;
	position: absolute;
	bottom: 20px;
	left: 90px;
	z-index: 2;
	width: 520px;
	height: auto;

	${onMWidth} {
		width: 480px;
		bottom: ${TOOL_TABLE_HEIGHT - 126}px;
	}
	@media (max-height: 800px) {
		width: 480px;
	}
`;

const StyledBottomDiv = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	z-index: 1;
	width: 100%;
	height: ${TOOL_TABLE_HEIGHT}px;
	background-color: #120644;
`;
