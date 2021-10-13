import { useState, useEffect } from 'react';

export interface Size {
	width: number;
	height: number;
}

export default function useWindowSize() {
	const [windowSize, setWindowSize] = useState<Size>({
		width: 0,
		height: 0,
	});
	useEffect(() => {
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}

		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const isMobileView = windowSize ? windowSize.width < 768 : false;

	return { windowSize, isMobileView } as const;
}
