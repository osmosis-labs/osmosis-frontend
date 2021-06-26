import React from 'react';
import cn from 'clsx';
import { staticAssetsDomain } from '../constants/urls';
import { wrapBaseDialog } from './base';
import { Img } from '../components/common/Img';

enum Vote {
	Yes,
	No,
	NoWithVeto,
	Abstain,
}
export const VoteDialog = wrapBaseDialog(({ proposalIndex, close }: { proposalIndex: number; close: () => void }) => {
	// TODO : fetch proposal data
	const proposal = {
		index: proposalIndex,
		title: 'Parameter change: lower minimum proposal deposit amount',
	};

	const [vote, setVote] = React.useState<Vote>(Vote.Yes);
	return (
		<div className="text-white-high w-full h-full">
			<div className="w-full flex items-center justify-between mb-9">
				<h5>Vote on governance proposal</h5>
				<button onClick={close} className="hover:opacity-75 cursor-pointer">
					<Img className="w-6 h-6" src={`${staticAssetsDomain}/public/assets/Icons/X.svg`} />
				</button>
			</div>
			<p className="text-white-mid mb-2.5">Proposal #{proposal.index}</p>
			<h6>{proposal.title}</h6>
			<ul className="mt-10">
				<li className="h-15 border-b border-white-faint flex items-center">
					<figure
						onClick={() => setVote(Vote.Yes)}
						className="rounded-full w-8 h-8 bg-white-faint flex items-center justify-center mr-5 cursor-pointer hover:opacity-75">
						<figure className={cn('rounded-full w-4 h-4 bg-secondary-200', { hidden: vote !== Vote.Yes })} />
					</figure>
					<h6>Yes</h6>
				</li>
				<li className="h-15 border-b border-white-faint flex items-center">
					<figure
						onClick={() => setVote(Vote.No)}
						className="rounded-full w-8 h-8 bg-white-faint flex items-center justify-center mr-5 cursor-pointer hover:opacity-75">
						<figure className={cn('rounded-full w-4 h-4 bg-secondary-200', { hidden: vote !== Vote.No })} />
					</figure>
					<h6>No</h6>
				</li>
				<li className="h-15 border-b border-white-faint flex items-center">
					<figure
						onClick={() => setVote(Vote.NoWithVeto)}
						className="rounded-full w-8 h-8 bg-white-faint flex items-center justify-center mr-5 cursor-pointer hover:opacity-75">
						<figure className={cn('rounded-full w-4 h-4 bg-secondary-200', { hidden: vote !== Vote.NoWithVeto })} />
					</figure>
					<h6>No with veto</h6>
				</li>
				<li className="h-15 flex items-center">
					<figure
						onClick={() => setVote(Vote.Abstain)}
						className="rounded-full w-8 h-8 bg-white-faint flex items-center justify-center mr-5 cursor-pointer hover:opacity-75">
						<figure className={cn('rounded-full w-4 h-4 bg-secondary-200', { hidden: vote !== Vote.Abstain })} />
					</figure>
					<h6>Abstain</h6>
				</li>
			</ul>
			<div className="grid grid-cols-2 gap-5 w-full mt-15 h-16">
				<button
					onClick={() => close()}
					className="h-full w-full rounded-2xl border-primary-200 border-4 shadow-elevation-04dp flex items-center justify-center mx-auto hover:opacity-75">
					<h6>Back</h6>
				</button>
				<button
					onClick={() => alert('Vote flow')}
					className={cn(
						'h-full w-full rounded-2xl bg-primary-200 shadow-elevation-04dp flex items-center justify-center mx-auto hover:opacity-75'
					)}>
					<h6>Vote</h6>
				</button>
			</div>
		</div>
	);
});
