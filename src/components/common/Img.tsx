import React, { FunctionComponent } from 'react';
import CoolImg from 'react-cool-img';

const retrySettings = { count: 0 };
export const Img: FunctionComponent<TImg> = ({ src, style, className, onClick, loadingSpin = false, error }) => {
	return React.useMemo(
		() => (
			<CoolImg
				onClick={onClick}
				style={style}
				src={src}
				alt={'img'}
				placeholder={loadingSpin ? '/public/assets/common/loading-spin.svg' : '/public/assets/common/empty.svg'}
				error={error ? error : '/public/assets/common/missing-icon.svg'}
				className={className}
				retry={retrySettings}
			/>
		),
		[src, style, className, loadingSpin, error, onClick]
	);
};

interface TImg {
	src?: string;
	style?: Record<string, any>;
	className?: string;
	onClick?: CallableFunction;
	loadingSpin?: boolean;
	error?: string;
}
