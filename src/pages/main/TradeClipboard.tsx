import * as React from 'react';
import { FunctionComponent } from 'react';
import { Container } from '../../components/containers';
import { TCardTypes } from '../../interfaces';
import { DisplayIcon } from '../../components/layouts/Sidebar/SidebarItem';
import { DisplayAmount } from '../../components/common/DIsplayAmount';
import { Img } from '../../components/common/Img';
import { LINKS } from '../../constants';

const defaultState = {
	from: {
		token: 'eth',
	},
	to: {
		token: 'atom',
	},
};
export const TradeClipboard: FunctionComponent = () => {
	// TODO : @Thunnini fetch user's max value
	const max = '3502.350215';

	const [state, useState] = React.useState(defaultState);
	return (
		<Container
			overlayClasses=""
			type={TCardTypes.CARD}
			className="w-full h-full shadow-elevation rounded-2xl relative border-2 border-cardInner">
			<ClipboardClip />
			<div className="p-2.5 h-full w-full">
				<div className="bg-cardInner rounded-md w-full h-full p-5">
					<section>
						<DisplayIcon
							className="cursor-pointer ml-auto"
							icon="/public/assets/Icons/Setting.svg"
							iconSelected="/public/assets/Icons/Setting_selected.svg"
						/>
					</section>
					<section className="mt-5 w-full">
						<FromBox />
					</section>
				</div>
			</div>
		</Container>
	);
};

const FromBox: FunctionComponent = () => {
	// TODO : @Thunnini connect api that retrieves current applicable tokens
	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4">
			<section className="flex justify-between items-center mb-2">
				<p>From</p>
				<div className="flex items-center">
					<div>
						<p className="inline-block text-sm leading-tight w-fit text-xs mr-2">Available</p>
						<DisplayAmount
							sizeInt={12}
							sizeDecimal={12}
							sizeCurrency={12}
							decimals={6}
							wrapperClass="w-fit text-primary-50"
							amount={3502.350215}
							currency={'ATOM'}
						/>
					</div>
					<button className="rounded-md py-1 px-1.5 bg-white-faint h-6 ml-1.25">
						<p className="text-xs">MAX</p>
					</button>
				</div>
			</section>
			<section className="flex justify-between items-center">
				<div className="flex items-center">
					<figure
						style={{ width: '56px', height: '56px' }}
						className="flex justify-center items-center rounded-full border-secondary-200 border">
						<Img style={{ width: '44px', height: '44px' }} src={LINKS.GET_TOKEN_IMG('eth')} />
					</figure>
				</div>
				<div className="" />
			</section>
		</div>
	);
};

const ClipboardClip: FunctionComponent = () => (
	<div
		style={{
			height: '60px',
			width: '160px',
			left: '50%',
			top: '-8px',
			background: 'linear-gradient(180deg, #3A3369 0%, #231D4B 100%)',
			transform: 'translate(-50%, 0)',
			boxShadow: '0px 2px 2px rgba(11, 16, 38, 0.48)',
		}}
		className="absolute rounded-md overflow-hidden">
		<div
			style={{
				height: '30px',
				width: '48px',
				left: '50%',
				bottom: '7px',
				transform: 'translate(-50%, 0)',
				background: 'rgba(91, 83, 147, 0.12)',
				backgroundBlendMode: 'difference',
			}}
			className="absolute rounded-lg z-10 ">
			<div
				style={{
					height: '30px',
					width: '48px',
					boxShadow: 'inset 1px 1px 1px rgba(0, 0, 0, 0.25)',
				}}
				className="aboslute rounded-md s-position-abs-center"
			/>
		</div>
		<div
			style={{
				height: '20px',
				left: '50%',
				bottom: '0px',
				transform: 'translate(-50%, 0)',
				background: 'linear-gradient(180deg, #332C61 0%, #312A5D 10.94%, #2D2755 100%)',
			}}
			className="z-0 absolute rounded-br-md rounded-bl-md w-full"
		/>
	</div>
);
