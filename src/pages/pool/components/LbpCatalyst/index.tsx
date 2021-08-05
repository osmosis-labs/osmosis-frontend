import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { QueriedPoolBase } from 'src/stores/osmosis/query/pool';

export const LbpCatalyst: FunctionComponent<{
	pool: QueriedPoolBase;
	lbpParams: NonNullable<QueriedPoolBase['smoothWeightChangeParams']>;
}> = observer(({ pool, lbpParams }) => {
	return (
		<section className="pb-10 max-w-max mx-auto">
			<h5 className="mb-7.5 ">LBP Stats</h5>
			<div className="w-full h-full rounded-xl bg-card py-6 px-7.5">
				<section className="flex mb-5">
					<div className="mr-10">
						<p className="text-base text-white-mid font-normal mb-1">Current Pool Weight</p>
						<p className="text-base font-medium">
							{pool.poolRatios
								.map(ratio => {
									return (
										ratio.ratio
											.trim(true)
											.maxDecimals(2)
											.toString() + '%'
									);
								})
								.join(' : ')}
						</p>
					</div>
					<div className="mr-10">
						<p className="text-base text-white-mid font-normal mb-1">Initial Pool Weight</p>
						<p className="text-base font-medium">
							{lbpParams.initialPoolWeights
								.map(weight => {
									return (
										weight.ratio
											.trim(true)
											.maxDecimals(2)
											.toString() + '%'
									);
								})
								.join(' : ')}
						</p>
					</div>
					<div>
						<p className="text-base text-white-mid font-normal mb-1">Target Pool Weight</p>
						<p className="text-base font-medium">
							{lbpParams.targetPoolWeights
								.map(weight => {
									return (
										weight.ratio
											.trim(true)
											.maxDecimals(2)
											.toString() + '%'
									);
								})
								.join(' : ')}
						</p>
					</div>
				</section>
				<section className="flex">
					<div className="mr-10">
						<p className="text-base text-white-mid font-normal mb-1">Start Time</p>
						<p className="text-base font-medium">
							{dayjs(lbpParams.startTime)
								.utc()
								.format('MMMM D, YYYY h:mm A') + ' UTC'}
						</p>
					</div>
					<div className="mr-10">
						<p className="text-base text-white-mid font-normal mb-1">End Time</p>
						<p className="text-base font-medium">
							{dayjs(lbpParams.endTime)
								.utc()
								.format('MMMM D, YYYY h:mm A') + ' UTC'}
						</p>
					</div>
				</section>
			</div>
		</section>
	);
});
