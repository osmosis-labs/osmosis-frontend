import { FunctionComponent } from 'react';
import noop from 'lodash-es/noop';
import { Img } from './Img';
import { LINKS, TOKENS } from '../../constants';
import upperCase from 'lodash-es/upperCase';
import cn from 'clsx';
import * as React from 'react';

export const TokenDisplay: FunctionComponent<ITokenDisplay> = ({ token, openSelector, setOpenSelector = noop }) => {
	return (
		<div className="flex items-center">
			<figure
				style={{ width: '56px', height: '56px' }}
				className="flex justify-center items-center rounded-full border-secondary-200 border mr-3">
				<Img loadingSpin style={{ width: '44px', height: '44px' }} src={LINKS.GET_TOKEN_IMG(token)} />
			</figure>
			<div className="flex flex-col">
				<div className="flex items-center">
					<h5 className="leading-none font-semibold">{upperCase(token)}</h5>
					<Img
						onClick={() => setOpenSelector((v: boolean) => !v)}
						className={cn(
							'h-6 w-8 ml-1 p-2 cursor-pointer opacity-40 hover:opacity-100',
							openSelector ? 'rotate-180' : ''
						)}
						src="/public/assets/Icons/Down.svg"
					/>
				</div>
				<p className="text-sm text-iconDefault mt-1">{TOKENS[token]?.LONG_NAME}</p>
			</div>
		</div>
	);
};
interface ITokenDisplay {
	token: string;
	openSelector?: boolean;
	setOpenSelector?: (bool: boolean | ((bool: boolean) => boolean)) => void;
}
