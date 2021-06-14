import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { wrapBaseDialog } from './base';
import { observer } from 'mobx-react-lite';
import { Img } from '../components/common/Img';
import { gt, multiply } from '../utils/Big';
import { applyOptionalDecimal, formatNumber } from '../utils/format';
import { isNumber } from '../utils/scripts';

enum MODAL_STAGE {
	MANAGE,
	UNSTAKE,
	REDELEGATE,
	STAKE,
}
interface IValidator {
	moniker: string;
	commission: number;
	website: string;
	description: string;
	imgSrc: string;
}
export const ManageStakingDialog = wrapBaseDialog(
	observer(({ validatorIndex }: { validatorIndex: number }) => {
		const [stage, setStage] = React.useState<MODAL_STAGE>(MODAL_STAGE.MANAGE);
		const closeDialog = React.useCallback(() => {
			close();
			setStage(MODAL_STAGE.MANAGE);
		}, [close]);

		// TODO : @Thunnini fetch validator info using validatorIndex
		const validator = {
			moniker: 'Sikka',
			commission: 0.03,
			website: 'https://sikka.tech',
			description: 'Sunny Aggarwal (@sunnya97) and Dev Ojha (@ValarDragon)',
			imgSrc: '',
		};

		// TODO : @Thunnini fetch my delegation
		const myDelegation = 32305.231;

		const content = React.useMemo(() => {
			if (stage === MODAL_STAGE.MANAGE)
				return <DisplayManage validator={validator} myDelegation={myDelegation} setStage={setStage} />;
			else if (stage === MODAL_STAGE.STAKE)
				return (
					<DisplayStake
						validator={validator}
						myDelegation={myDelegation}
						setStage={setStage}
						closeDialog={closeDialog}
					/>
				);
		}, [stage, validator, closeDialog]);
		return (
			<div className="text-white-high w-full h-full">
				<h5 className="mb-10">Stake OSMO</h5>
				<div className="flex items-center mb-5">
					<figure
						style={{ width: '80px', height: '80px' }}
						className="flex justify-center items-center rounded-full border-secondary-200 border mr-5">
						<Img loadingSpin style={{ width: '66px', height: '66px' }} src={validator.imgSrc} />
					</figure>
					<div className="h-full flex items-center">
						<div>
							<h5 className="mb-1">{validator.moniker}</h5>
							<p>Commission - {applyOptionalDecimal(multiply(validator.commission, 100, 2))}%</p>
						</div>
					</div>
				</div>
				{content}
			</div>
		);
	})
);

const DisplayStake: FunctionComponent<{
	validator: IValidator;
	myDelegation: number;
	setStage: Dispatch<SetStateAction<MODAL_STAGE>>;
	closeDialog: () => void;
}> = observer(({ validator, myDelegation, setStage, closeDialog }) => {
	// TODO : @Thunnini get available balance
	const available = 32.5832105;

	const [input, setInput] = React.useState('');

	const onStake = React.useCallback(
		input => {
			if (input === '' || input === '0') return alert('Input amount is empty');
			if (gt(input, available)) return alert('Input amount is larger than available balance');
			alert('Successfully staked!');
			closeDialog();
		},
		[closeDialog]
	);

	return (
		<>
			<div className="w-full border border-secondary-200 rounded-2xl text-secondary-200 flex p-5">
				<Img className="w-10 h-10 mr-5" src={'/public/assets/Icons/Warning.svg'} />
				<div>
					<h6>Staking will lock your OSMO for 21 days</h6>
					<p className="mt-2 tracking-wide">
						You will need to undelegate in order for your staked assets to be liquid again. This process will take 21
						days to complete.
					</p>
				</div>
			</div>
			<div className="my-5">
				<p>My Delegation</p>
				<p className="text-white-mid mt-1">{formatNumber(myDelegation)} OSMO</p>
			</div>
			<div className="my-5">
				<p>Available Balance</p>
				<p className="text-white-mid mt-1">{formatNumber(available)} OSMO</p>
			</div>
			<div className="my-5">
				<p>Amount to Delegate</p>
				<div
					className="mt-2 border border-white-mid w-full h-12 rounded-lg py-3 px-5 grid gap-1"
					style={{ gridTemplateColumns: '1fr fit-content(100%)' }}>
					<input
						onInput={e => {
							e.preventDefault();
							if (!isNumber(e.currentTarget.value)) return;
							setInput(`${e.currentTarget.value}`);
						}}
						className="text-white-high w-full text-right"
						value={input}
					/>
					<p className="text-white-mid">OSMO</p>
				</div>
			</div>
			<div className="mt-10 w-full h-16 grid grid-cols-2 gap-5">
				<button
					onClick={() => setStage(MODAL_STAGE.MANAGE)}
					className="border-4 border-primary-200 rounded-2xl flex items-center justify-center hover:opacity-75">
					<h6>Unstake</h6>
				</button>
				<button
					onClick={() => onStake(input)}
					className="rounded-2xl bg-primary-200 flex items-center justify-center hover:opacity-75">
					<h6>Stake</h6>
				</button>
			</div>
		</>
	);
});

const DisplayManage: FunctionComponent<{
	validator: IValidator;
	myDelegation: number;
	setStage: Dispatch<SetStateAction<MODAL_STAGE>>;
}> = ({ validator, myDelegation, setStage }) => {
	return (
		<>
			<div className="mb-5">
				<p className="mb-1">Website</p>
				<a className="text-white-mid hover:opacity-75" target="__blank" href={validator.website}>
					{validator.website.split('://')[1]}
				</a>
			</div>
			<div className="pb-5 border-b border-white-faint w-full">
				<p className="mb-1">Description</p>
				<p className="text-white-mid">{validator.description}</p>
			</div>
			<div className="mt-5 mb-10 flex items-center justify-between w-full">
				<p>My Delegation</p>
				<p className="text-white-mid">{formatNumber(myDelegation)} OSMO</p>
			</div>
			<div className="mt-10 w-full h-16 grid grid-cols-2 gap-5">
				<button
					onClick={() => alert('Unstake flow')}
					className="border-4 border-primary-200 rounded-2xl flex items-center justify-center hover:opacity-75">
					<h6>Unstake</h6>
				</button>
				<button
					onClick={() => setStage(MODAL_STAGE.STAKE)}
					className="rounded-2xl bg-primary-200 flex items-center justify-center hover:opacity-75">
					<h6>Stake</h6>
				</button>
			</div>
			<div className="w-full mt-2.5 flex items-center justify-center">
				<button
					onClick={() => alert('Switch Validator flow')}
					style={{ width: '183px' }}
					className="h-9 flex items-center justify-center hover:opacity-75">
					<p className="mr-0.5 text-primary-50">Or Switch Validator</p>
					<Img
						style={{
							filter:
								'brightness(0%) invert(56%) sepia(48%) saturate(2872%) hue-rotate(212deg) brightness(100%) contrast(102%)',
						}}
						className="w-6 h-6"
						src={'/public/assets/Icons/Right.svg'}
					/>
				</button>
			</div>
		</>
	);
};
