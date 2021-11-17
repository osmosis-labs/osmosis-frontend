import styled from '@emotion/styled';
import React, { FunctionComponent, ReactNode, useEffect, useRef, useState } from 'react';
import { colorPrimaryDarker } from 'src/emotionStyles/colors';
import { TradeClipboard } from './components/TradeClipboard';
import useWindowSize from 'src/hooks/useWindowSize';

const ProgressiveSVGImage: FunctionComponent<React.SVGProps<SVGImageElement> & {
	lowResXlinkHref: string;
}> = props => {
	const ref = useRef<SVGImageElement | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		// At first, load the low-res image and high-res image at the same time.
		// And if the high-res image loaded, remove the low-res image.
		// Expectedly, because the webside loads the image from the cache on the user’s second visit to the website, the loading should be very fast.
		if (ref.current) {
			ref.current.addEventListener(
				'load',
				() => {
					setIsLoaded(true);
				},
				{
					once: true,
				}
			);
		}
	}, []);

	return (
		<React.Fragment>
			{!isLoaded ? <image {...props} xlinkHref={props.lowResXlinkHref} /> : null}
			<image {...props} />
		</React.Fragment>
	);
};

const Background: FunctionComponent = () => {
	const sidebarWidth = 206;

	const { windowSize, isMobileView } = useWindowSize();

	const componentWidth = windowSize.width - sidebarWidth;
	const ratio = componentWidth / windowSize.height;

	return (
		<svg
			className="absolute w-full h-full"
			viewBox="0 0 1300 900"
			height="900"
			preserveAspectRatio={ratio > 1.444 ? 'xMinYMid meet' : 'xMidYMid slice'}>
			<g>
				{!isMobileView ? (
					<image
						xlinkHref="/public/assets/backgrounds/osmosis-home-bg-pattern.svg"
						x="20"
						y="20"
						width="2252.2917"
						height="809.7202"
					/>
				) : null}
				{/* If the width is too small, it is not shown. "1.1" is a value determined by sense. */}
				{!isMobileView && ratio > 1.1 ? (
					<React.Fragment>
						<ProgressiveSVGImage
							lowResXlinkHref="/public/assets/backgrounds/osmosis-home-bg-low.png"
							xlinkHref="/public/assets/backgrounds/osmosis-home-bg.png"
							x="56"
							y="97"
							width="578.7462"
							height="725.6817"
						/>
						<rect x="-3000" y="778" width="8660" height="244" fill="#120644" />
						<ProgressiveSVGImage
							lowResXlinkHref="/public/assets/backgrounds/osmosis-home-fg-low.png"
							xlinkHref="/public/assets/backgrounds/osmosis-home-fg.png"
							x="61"
							y="602"
							width="448.8865"
							height="285.1699"
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
	background-repeat: repeat-x;
	background-size: cover;
	overflow: auto;
	height: 100vh;
	position: relative;
	@media (max-width: 800px) {
		width: 520px;
	}
	@media (max-width: 768px) {
		background-image: url('/public/assets/backgrounds/osmosis-home-bg-pattern.svg');
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

	@media (min-width: 768px) {
		margin-bottom: 130px;
	}
`;
