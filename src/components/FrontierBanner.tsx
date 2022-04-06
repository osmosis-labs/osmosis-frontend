import React, { FunctionComponent } from 'react';
import { IconExternalLink } from 'src/icons';

export const FrontierBanner: FunctionComponent<{ onClose: () => void }> = ({ onClose }) => (
	<div
		style={{ zIndex: 1000, backgroundImage: 'linear-gradient(to bottom, #F8C259 0%, #B38203 100%)' }}
		className="absolute inset-x-1/3 top-3 text-white-high w-[596px] h-[68px] z-50 rounded-2xl flex flex-col">
		<div className="m-auto">
			<img
				className="absolute -top-1.5 -left-1.5 cursor-pointer"
				src="/public/assets/Icons/Icon-Close.svg"
				onClick={() => onClose()}
			/>
			<div className="flex items-center gap-4">
				<img src="/public/assets/Icons/Information.svg" />
				<div>
					<h6>You{"'"}ve entered the Osmosis Frontier</h6>
					<div className="text-xs font-body flex gap-1">
						You{"'"}re viewing all permissionless assets.{' '}
						<a className="flex gap-2 items-center">
							Click here to return to the main app. <IconExternalLink />
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
);
