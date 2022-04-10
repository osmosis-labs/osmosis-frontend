import React, { FunctionComponent } from 'react';
import { IconExternalLink } from 'src/icons';

export const FrontierBanner: FunctionComponent<{ onClose: () => void }> = ({ onClose }) => (
	<div
		style={{ zIndex: 1000, backgroundImage: 'linear-gradient(to bottom, #F8C259 0%, #B38203 100%)' }}
		className="absolute right-3 top-3 py-3 text-white-high w-[440px] md:w-[596px] max-w-screen-sm z-50 rounded-2xl flex flex-col">
		<div className="m-auto">
			<img
				className="absolute -top-1.5 -left-1.5 cursor-pointer"
				src="/public/assets/Icons/Icon-Close.svg"
				onClick={() => onClose()}
			/>
			<div className="px-2 flex items-center gap-2 md:gap-4">
				<img className="shrink-0" src="/public/assets/Icons/Information.svg" />
				<div className="flex flex-col gap-1">
					<h6>You{"'"}ve entered the Osmosis Frontier</h6>
					<div className="text-xs font-body flex flex-wrap gap-1">
						You{"'"}re viewing all permissionless assets.{' '}
						<a className="flex gap-2 items-center" href="https://app.osmosis.zone/" target="_self">
							Click here to return to the main app. <IconExternalLink />
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
);
