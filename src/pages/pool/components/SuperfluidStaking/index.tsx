import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { TitleText } from 'src/components/Texts';
import useWindowSize from 'src/hooks/useWindowSize';
import { useStore } from 'src/stores';
import { Staking } from '@keplr-wallet/stores';
import { Dec, DecUtils } from '@keplr-wallet/unit';

export const SuperfluidStaking: FunctionComponent<{ poolId: string }> = observer(({ poolId }) => {
	const { isMobileView } = useWindowSize();
	const { accountStore, queriesStore, chainStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);
	const poolShareCurrency = queries.osmosis.queryGammPoolShare.getShareCurrency(poolId);

	const superfluidDelegations = queries.osmosis.querySuperfluidDelegations
		.getQuerySuperfluidDelegations(account.bech32Address)
		.getDelegations(poolShareCurrency);
	const queryActiveValidators = queries.cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded);
	const activeValidators = queryActiveValidators.validators;
	const superfluidDelegatedValidators = activeValidators.filter(activeValidator =>
		superfluidDelegations?.some(
			delegation => delegation.validator_address.split('superbonding/')[1] === activeValidator.operator_address
		)
	);

	return (
		<div>
			<TitleText isMobileView={isMobileView} pb={isMobileView ? 10 : 20}>
				Superfluid Staking
			</TitleText>
			{Array.isArray(superfluidDelegations) && superfluidDelegations.length > 0 ? (
				<div className="bg-sfs p-0.5 rounded-2xl">
					<div className="p-4.5 bg-card rounded-2xl">
						<div className="pb-4 border-b border-white-faint font-body font-semibold flex justify-between items-center">
							<span>My Superfluid Validator</span>
							<span>My Superfluid Delegation</span>
						</div>
						{superfluidDelegatedValidators.map(validator => {
							const validatorThumbnail = queryActiveValidators.getValidatorThumbnail(validator.operator_address);

							return (
								<div key={validator.operator_address} className="pt-4 flex justify-between items-center">
									<div className="rounded-full border border-enabledGold w-15 h-15 p-1.5 flex justify-center items-center flex-shrink-0">
										<img
											src={validatorThumbnail || '/public/assets/Icons/Profile.svg'}
											alt="validator thumbnail"
											className={`rounded-full ${validatorThumbnail ? 'w-full h-full' : 'w-9 h-9'}`}
										/>
									</div>
									<div className="ml-5 w-full">
										<div className="flex items-center justify-between text-lg font-semibold leading-6">
											<span>{validator.description.moniker}</span>
											<span>~100,000,000 OSMO</span>
										</div>
										<div className="mt-1 flex items-center justify-between text-iconDefault">
											<span>
												Commission -{' '}
												{DecUtils.trim(
													new Dec(validator.commission.commission_rates.rate)
														.mul(DecUtils.getTenExponentN(2))
														.toString(1)
												)}
												%
											</span>
											<span>~999.92% APR</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			) : (
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
			)}
		</div>
	);
});
