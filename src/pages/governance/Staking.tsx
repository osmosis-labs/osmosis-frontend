import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import times from 'lodash-es/times';
import map from 'lodash-es/map';
import { Img } from '../../components/common/Img';
import { formatNumber, applyOptionalDecimal } from '../../utils/format';
import { multiply } from '../../utils/Big';
import { ManageStakingDialog } from '../../dialogs';

const ROW_HEIGHT = 72;
const ROW_WIDTHS = ['5%', '20%', '35%', '25%', '15%'];
export const StakingTab: FunctionComponent = () => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [focusedValidatorIndex, setFocusedValidatorIndex] = React.useState(0);
	const stakingData: IStakedValidator[] = times(8, i => ({
		index: i + 1,
		moniker: 'Validator Name',
		img: '',
		amount: 130210123,
		percent: 0.1253,
		commission: 0.1,
	}));

	const openManageModal = React.useCallback(index => {
		setFocusedValidatorIndex(index);
		setIsOpen(true);
	}, []);

	return (
		<>
			<table className="w-full h-full">
				{/*<thead></thead>*/}
				<tbody className="w-full h-full">
					{map(stakingData, (data, i) => (
						<StakingRow key={i} data={data} height={72} openModal={() => openManageModal(data.index)} />
					))}
				</tbody>
			</table>
			<ManageStakingDialog
				style={{ minWidth: '656px', maxWidth: '656px', padding: '48px' }}
				isOpen={isOpen}
				close={() => setIsOpen(false)}
				validatorIndex={focusedValidatorIndex}
			/>
		</>
	);
};
interface IStakedValidator {
	index: number;
	moniker: string;
	img: string;
	amount: number;
	percent: number;
	commission: number;
}

const StakingRow: FunctionComponent<{ data: IStakedValidator; height: number; openModal: () => void }> = ({
	data,
	height,
	openModal,
}) => {
	let i = 0;
	return (
		<tr style={{ height: `${height}px` }} className="px-5 w-full flex items-center border-b border-white-faint">
			<td className="pr-1" style={{ width: ROW_WIDTHS[i++] }}>
				<p className="text-white-disabled">{data.index}</p>
			</td>
			<td className="px-2" style={{ width: ROW_WIDTHS[i++] }}>
				<div className="flex items-center">
					<Img className="w-9 h-9 rounded-full mr-3" src={data.img} />
					<p className="text-white-high">{data.moniker}</p>
				</div>
			</td>
			<td className="px-3 flex items-center justify-end" style={{ width: ROW_WIDTHS[i++] }}>
				<p>
					{formatNumber(data.amount)} OSMO({multiply(data.percent, 100, 2)})
				</p>
			</td>
			<td className="px-4 flex items-center justify-end" style={{ width: ROW_WIDTHS[i++] }}>
				<p className="text-white-disabled">{applyOptionalDecimal(multiply(data.commission, 100, 2))}%</p>
			</td>
			<td className="pl-4 flex items-center justify-end" style={{ width: ROW_WIDTHS[i++] }}>
				<button onClick={openModal} className="hover:opacity-75 cursor-pointer flex items-center">
					<p className="text-secondary-200 mr-1">Manage</p>
					<Img className="w-6 h-6 object-fill" src={'/public/assets/Icons/Right.svg'} />
				</button>
			</td>
		</tr>
	);
};
