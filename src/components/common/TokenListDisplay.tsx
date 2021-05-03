import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { IToken, LINKS, TOKENS } from '../../constants';
import { Img } from './Img';
import { mapKeyValues } from '../../utils/scripts';
import map from 'lodash-es/map';
import times from 'lodash-es/times';

const tokensArr = mapKeyValues(TOKENS, (key: string, value: IToken) => {
	return { ...value, key, channel: 'Channel-1' };
});

const defaultTokenAmounts = times(tokensArr.length, i => 0.3242);
export const TokenListDisplay: FunctionComponent<ITokenListDisplay> = ({ onSelect, close }) => {
	// TODO : @Thunnini add channel data to each token
	const [tokenData, setTokenData] = React.useState<ITokenData[]>(tokensArr);

	const [tokenAmount, setTokenAmount] = React.useState<number[]>(defaultTokenAmounts);

	return (
		<div className="pr-5 pl-4 pt-8 pb-8">
			<div className="w-full h-9 rounded-2xl bg-card pl-4.5 flex items-center">
				<Img className="w-4.5 h-4.5" src="/public/assets/Icons/Search.svg" />
				<input
					onClick={() => alert('To be implemented')}
					className="pl-4 w-full pr-4"
					placeholder="Search your token"
				/>
			</div>
			<ul className="mt-5">
				{map(tokenData, (obj, i) => (
					<TokenItem
						key={i}
						amount={tokenAmount[i]}
						data={obj}
						onSelect={() => {
							onSelect(obj.key);
							close();
						}}
					/>
				))}
			</ul>
		</div>
	);
};

interface ITokenListDisplay {
	onSelect: (newToken: string) => void;
	close: () => void;
}

const TokenItem: FunctionComponent<ITokenItem> = ({ data, amount, onSelect }) => {
	return (
		<li onClick={() => onSelect()} className="py-4.5 px-3 rounded-2xl hover:bg-card cursor-pointer">
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<Img loadingSpin style={{ width: '36px', height: '36px' }} src={LINKS.GET_TOKEN_IMG(data.key)} />
					<div className="ml-3">
						<h6 className="leading-tight">{data.key.toUpperCase()}</h6>
						<p className="text-iconDefault text-md leading-tight">{data.channel}</p>
					</div>
				</div>
				<p>{amount}</p>
			</div>
		</li>
	);
};

interface ITokenItem {
	data: ITokenData;
	amount: number;
	onSelect: () => void;
}

interface ITokenData extends IToken {
	key: string;
	channel: string;
}
