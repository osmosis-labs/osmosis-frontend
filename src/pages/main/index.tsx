import styled from '@emotion/styled';
import React, { FunctionComponent, ReactNode, useEffect, useRef, useState } from 'react';
import { colorPrimaryDarker } from 'src/emotionStyles/colors';
import { TradeClipboard } from './components/TradeClipboard';
import useWindowSize from 'src/hooks/useWindowSize';

const ProgressiveSVGImage: FunctionComponent<React.SVGProps<SVGImageElement> & {
	lowResXlinkHref: string;
}> = ({ lowResXlinkHref, ...props }) => {
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
			{!isLoaded ? <image {...props} xlinkHref={lowResXlinkHref} /> : null}
			<image {...props} ref={ref} />
		</React.Fragment>
	);
};

const Background: FunctionComponent = () => {
	const sidebarWidth = 206;

	const { windowSize } = useWindowSize();

	const componentWidth = windowSize.width - sidebarWidth;
	const ratio = componentWidth / windowSize.height;

	return (
		<svg
			className="absolute w-full h-full hidden md:block"
			pointerEvents="none"
			viewBox="0 0 1300 900"
			height="900"
			preserveAspectRatio={ratio > 1.444 ? 'xMinYMid meet' : 'xMidYMid slice'}>
			<g>
				{windowSize.width >= 1350 ? (
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
			<TradeClipboardContainer>
				<Background />
				<TradeClipboardWrapper>
					<TradeClipboard />
				</TradeClipboardWrapper>
			</TradeClipboardContainer>
		</PageContainer>
	);
};

const PageContainer = styled.div`
	width: 100%;
	background-image: url('/public/assets/backgrounds/osmosis-home-bg-pattern.svg');
	background-repeat: repeat-x;
	background-size: cover;
	overflow: auto;
	position: relative;

	@media (min-width: 768px) {
		background-color: ${colorPrimaryDarker};
	}
`;

const TradeClipboardContainer = styled.div`
	margin: 0 auto;
	max-width: 520px;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;

	@media (min-width: 768px) {
		margin: 0;
		max-width: unset;
	}
`;

function TradeClipboardWrapper({ children }: { children: ReactNode }) {
	return (
		<TradePosition>
			<TradeContainer>{children}</TradeContainer>
		</TradePosition>
	);
}

const TradePosition = styled.div`
	position: static;
	padding: 96px 20px 64px;
	z-index: 3;
	width: 100%;

	@media (min-width: 768px) {
		position: absolute;
		padding: 0;
		width: 519.453px;
		left: 50%;
		transform: translateX(-50%);
	}

	@media (min-width: 1350px) {
		--tradeMinLeft: calc(920 * (100vh / 1080));
		--tradePositionLeft: calc((100vw - 206px) * 0.8 - 520px);
		left: min(var(--tradeMinLeft), var(--tradePositionLeft));
		transform: unset;
	}
`;

const TradeContainer = styled.div`
	width: 100%;
	max-height: 678px;
`;
