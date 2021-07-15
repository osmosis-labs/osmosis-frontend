import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { TradeClipboard } from './TradeClipboard';

export const MainPage: FunctionComponent = () => {
	const [ratio, setRatio] = useState(document.body.clientWidth / document.body.clientHeight);

	useEffect(() => {
		const calcAspectRatio = () => {
			setRatio(document.body.clientWidth / document.body.clientHeight);
		};

		window.addEventListener('resize', calcAspectRatio);

		return () => {
			window.removeEventListener('resize', calcAspectRatio);
		};
	}, []);

	useEffect(() => {
		setRatio(() => document.body.clientWidth / document.body.clientHeight);
	}, [ratio]);

	const bgRef = useRef<SVGImageElement>(null);
	const [bgLoaded, setBgLoaded] = useState(false);
	const fgRef = useRef<SVGImageElement>(null);
	const [fgLoaded, setFgLoaded] = useState(false);
	useEffect(() => {
		// At first, load the compressed images and high-res images at the same time.
		// And if the high-res images loaded, remove the compressed images.
		// Expectedly, because the webside loads the image from the cache on the user’s second visit to the website, the loading should be very fast.
		if (bgRef.current) {
			bgRef.current.addEventListener(
				'load',
				() => {
					setBgLoaded(true);
				},
				{
					once: true,
				}
			);
		}

		if (fgRef.current) {
			fgRef.current.addEventListener(
				'load',
				() => {
					setFgLoaded(true);
				},
				{
					once: true,
				}
			);
		}
	}, []);

	return (
		<div className="relative w-full h-full grid" style={{ gridTemplateColumns: '2fr 520px 1fr' }}>
			<div />
			<div className="grid w-full h-full z-30" style={{ gridTemplateRows: '2fr 672px 3fr' }}>
				<div />
				<div style={{ maxWidth: '520px' }}>
					<TradeClipboard />
				</div>
				<div />
			</div>
			<div />
			<div className="absolute top-0 left-0 w-full h-full overflow-visible z-0">
				<svg
					className="w-full h-full"
					viewBox="0 0 1300 900"
					height="900"
					preserveAspectRatio={ratio > 1.444 ? 'xMinYMid meet' : 'xMidYMid slice'}>
					<g>
						<image
							xlinkHref="/public/assets/backgrounds/osmosis-home-bg-pattern.svg"
							x="20"
							y="20"
							width="2252.2917"
							height="809.7202"
						/>
						{!bgLoaded ? (
							<image
								xlinkHref="/public/assets/backgrounds/osmosis-home-bg-low.png"
								x="56"
								y="97"
								width="578.7462"
								height="725.6817"
							/>
						) : null}
						<image
							ref={bgRef}
							xlinkHref="/public/assets/backgrounds/osmosis-home-bg.png"
							x="56"
							y="97"
							width="578.7462"
							height="725.6817"
						/>
						<rect x="-3000" y="778" width="8660" height="244" fill="#120644" />
						{!fgLoaded ? (
							<image
								xlinkHref="/public/assets/backgrounds/osmosis-home-fg-low.png"
								x="61"
								y="602"
								width="448.8865"
								height="285.1699"
							/>
						) : null}
						<image
							ref={fgRef}
							xlinkHref="/public/assets/backgrounds/osmosis-home-fg.png"
							x="61"
							y="602"
							width="448.8865"
							height="285.1699"
						/>
					</g>
				</svg>
			</div>
		</div>
	);
};
