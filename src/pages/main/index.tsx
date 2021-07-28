import styled from '@emotion/styled';
import React, { FunctionComponent, ReactNode } from 'react';
import ProgressiveImage from 'react-progressive-image';
import { useWindowSize } from 'react-use';
import { colorPrimary } from '../../emotionStyles/colors';
import { onLWidth, onMWidth, onSWidth, onXlWidth, onXsWidth } from '../../emotionStyles/mediaQueries';
import { TradeClipboard } from './TradeClipboard';

const TOOL_TABLE_HEIGHT = 180;

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
	height: 100vh;
	overflow: hidden;
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
		marginBottom: windowHeight < 720 ? 0 : 130,
	})};
	width: 520px;
	height: 672px;

	${onXsWidth} {
		width: 500px;
	}
`;

function BgImageContainer() {
	return (
		<>
			<ProgressiveImage
				placeholder="/public/assets/backgrounds/osmosis-home-bg-low.png"
				src="/public/assets/backgrounds/osmosis-home-bg.png">
				{(src: string) => <ImgOsmoGuy src={src} alt="Osmosis guy" />}
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

const ImgOsmoGuy = styled.img`
	display: block;
	position: absolute;
	bottom: ${TOOL_TABLE_HEIGHT - 66}px;
	left: 84px;
	z-index: 0;
	width: 820px;
	height: auto;

	${onXlWidth} {
		width: 640px;
		left: 10px;
		bottom: ${TOOL_TABLE_HEIGHT - 36}px;
	}

	${onLWidth} {
		width: 520px;
		left: 10px;
		bottom: ${TOOL_TABLE_HEIGHT - 36}px;
	}

	${onMWidth} {
		width: 440px;
		bottom: ${TOOL_TABLE_HEIGHT - 26}px;
	}
`;

const ImgScienceTools = styled.img`
	display: block;
	position: absolute;
	bottom: 20px;
	left: 90px;
	z-index: 2;
	width: 666px;
	height: auto;

	${onMWidth} {
		width: 480px;
		bottom: ${TOOL_TABLE_HEIGHT - 126}px;
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
