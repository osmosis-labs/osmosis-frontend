import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'src/stores';

export const PoolCreationFeeView: FunctionComponent = observer(() => {
	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const queryPoolCreationFee = queries.osmosis.queryPoolCreationFee;

	return (
		<div className="mt-5 px-4.5 py-3.5 border rounded-2xl border-enabledGold">
			<div className="flex flex-row">
				<div className="mr-3 inline-block rounded-full w-5 h-5 text-sm bg-secondary-200 flex items-center justify-center text-black">
					i
				</div>
				<div className="flex flex-col">
					<h6
						className="text-white-high font-normal font-semibold"
						style={{
							lineHeight: '24px',
						}}>
						Pool Creation Fee
					</h6>
					<p
						className="text-sm text-iconDefault font-medium"
						style={{
							lineHeight: '20px',
						}}>
						Transferred to the Osmosis community pool
					</p>
				</div>
				<div className="flex-1" />
				<div className="flex flex-col">
					<div className="flex-1" />
					<div className="flex flex-row items-center">
						{queryPoolCreationFee.isFetching ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								className="animate-spin mr-2 h-3.5 w-3.5 text-white"
								viewBox="0 0 24 24">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
								<path
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									className="opacity-75"
								/>
							</svg>
						) : null}
						<p className="text-base text-white-high font-semibold">
							{queryPoolCreationFee.poolCreationFee
								.map(fee =>
									fee
										.trim(true)
										.maxDecimals(6)
										.toString()
								)
								.join(',')}
						</p>
					</div>
					<div className="flex-1" />
				</div>
			</div>
		</div>
	);
});
