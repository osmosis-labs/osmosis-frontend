import React, { FunctionComponent } from 'react';
import { TitleText } from 'src/components/Texts';
import useWindowSize from 'src/hooks/useWindowSize';

export const SuperfluidStaking: FunctionComponent<{ isSuperfluidEnabled: boolean }> = ({ isSuperfluidEnabled }) => {
	const { isMobileView } = useWindowSize();

	return (
		<div>
			<TitleText isMobileView={isMobileView} pb={isMobileView ? 10 : 20}>
				Superfluid Staking
			</TitleText>
			<div className="bg-card p-5 rounded-2xl flex items-center justify-between font-body">
				<div>
					<div className="text-base font-semibold text-white-high">Superfluid Staking Inactive</div>
					<div className="mt-2 text-sm font-medium text-iconDefault">
						You have a superfluid eligible bonded liquidity.
						<br />
						Choose a Superfluid Staking validator to earn additional rewards.
					</div>
				</div>
				<button className="bg-sfs rounded-lg py-2 px-8 text-white-high font-semibold text-sm shadow-elevation-04dp">
					Go Superfluid
				</button>
			</div>
		</div>
	);
};
