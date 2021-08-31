import styled from '@emotion/styled';
import { Dec, IntPretty } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { TitleText } from 'src/components/Texts';
import { colorPrimaryDarker } from 'src/emotionStyles/colors';
import { useStore } from 'src/stores';

export const MyAirdropProgress = observer(function MyAirdropProgress() {
	const { chainStore, queriesStore, accountStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const claimRecord = queries.osmosis.queryClaimRecord.get(account.bech32Address);

	const totalClaimable = claimRecord.initialClaimableAmountOf(chainStore.current.stakeCurrency.coinMinimalDenom);

	const completed = claimRecord.completedActions;

	const countOfCompleted = (() => {
		let count = 0;
		for (const key of Object.keys(completed)) {
			if (key in completed && completed[key as 'addLiquidity' | 'swap' | 'vote' | 'delegate']) {
				count++;
			}
		}
		return count;
	})();

	// Actually 1/5 of airdrop is distributes from the genesis.
	// If there is no initial claimable, assume that the user is not deserved to get the airdrop.
	// Else, add the 20% to the percentage
	let percent = totalClaimable.toDec().equals(new Dec(0)) ? new IntPretty(new Dec(0)) : new IntPretty(new Dec(20));
	percent = percent.add(new Dec(20 * countOfCompleted));

	return (
		<>
			<TitleText pb={4}>My Progress</TitleText>
			<ProgressBarSection>
				<TitleText size="2xl" pb={0} style={{ textAlign: 'right' }}>
					{percent.maxDecimals(0).toString()}%
				</TitleText>
				<ProgressBar>
					<ProgressBarValue percent={percent.maxDecimals(0).toString()} />
				</ProgressBar>
			</ProgressBarSection>
		</>
	);
});

const ProgressBarSection = styled.div`
	width: 100%;
	margin-bottom: 18px;
`;

const ProgressBar = styled.div`
	width: 100%;
	position: relative;
	height: 0.75rem;
	border-radius: 1rem;
	background-color: ${colorPrimaryDarker};
	margin-top: 10px;
`;

const ProgressBarValue = styled.div<{ percent: string | number }>`
	width: ${({ percent }) => percent}%;
	position: absolute;
	border-radius: 1rem;
	height: 0.75rem;
	left: 0;
	top: 0;
	background: linear-gradient(270deg, #89eafb 0%, #1377b0 100%);
`;
