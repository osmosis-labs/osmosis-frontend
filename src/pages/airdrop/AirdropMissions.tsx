import styled from '@emotion/styled';
import { Dec } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React, { HTMLAttributes } from 'react';
import { SubTitleText, Text, TitleText } from 'src/components/Texts';
import { colorWhiteFaint } from 'src/emotionStyles/colors';
import { useStore } from 'src/stores';
import useWindowSize from 'src/hooks/useWindowSize';

export const ActionToDescription: { [action: string]: string } = {
	addLiquidity: 'Add liquidity to a pool',
	swap: 'Make a swap on Osmosis AMM',
	vote: 'Vote on a governance proposal',
	delegate: 'Stake OSMO',
};

export const AirdropMissions = observer(function AirdropMissions(props: HTMLAttributes<HTMLDivElement>) {
	const { chainStore, queriesStore, accountStore } = useStore();
	const { isMobileView } = useWindowSize();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const claimRecord = queries.osmosis.queryClaimRecord.get(account.bech32Address);
	const isIneligible = claimRecord
		.initialClaimableAmountOf(chainStore.current.stakeCurrency.coinMinimalDenom)
		.toDec()
		.equals(new Dec(0));

	return (
		<AirdropMissionsContainer {...props}>
			<TitleText isMobileView={isMobileView} pb={isMobileView ? 10 : 16}>
				Missions
			</TitleText>
			<MissionCardList>
				<MissionCard
					num={0}
					complete={!isIneligible}
					description="Hold ATOM on February 18"
					ineligible={isIneligible}
					isMobileView={isMobileView}
				/>
				{Object.entries(claimRecord.completedActions)
					.sort(([action1], [action2]) => {
						/*
						 Move "vote" action to the end.
						 Some people could think that the actions should be executed in order.
						 But, the "vote" action can't be executed before the "stake" action.
						 So, to reduce the confusion of new users, Move "vote" action to after the "stake" action.
						 */
						if (action1 === 'vote') {
							return 1;
						}
						if (action2 === 'vote') {
							return -1;
						}
						return 0;
					})
					.map(([action, value]) => {
						return (
							<MissionCard
								key={action}
								num={
									Object.keys(claimRecord.completedActions)
										.sort((action1, action2) => {
											if (action1 === 'vote') {
												return 1;
											}
											if (action2 === 'vote') {
												return -1;
											}
											return 0;
										})
										.indexOf(action) + 1
								}
								complete={value}
								ineligible={isIneligible}
								description={ActionToDescription[action] ?? 'Oops'}
								isMobileView={isMobileView}
							/>
						);
					})}
			</MissionCardList>
		</AirdropMissionsContainer>
	);
});

const AirdropMissionsContainer = styled.div`
	width: 100%;
	margin-top: 24px;

	@media (min-width: 768px) {
		margin-top: 48px;
	}
`;

const MissionCardList = styled.ul`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

interface MissionCardProps {
	num: number;
	description: string;
	complete: boolean;
	ineligible: boolean;
	isMobileView: boolean;
}

function MissionCard({ num, description, complete, ineligible, isMobileView }: MissionCardProps) {
	return (
		<MissionCardContainer>
			<div>
				<Text emphasis="high" pb={8} isMobileView={isMobileView}>
					Mission #{num}
				</Text>
				<SubTitleText pb={0} isMobileView={isMobileView}>
					{description}
				</SubTitleText>
			</div>
			<SubTitleText color={complete ? 'green' : 'red'} isMobileView={isMobileView}>
				{ineligible ? 'Ineligible' : complete ? 'Complete' : 'Not Complete'}
			</SubTitleText>
		</MissionCardContainer>
	);
}

const MissionCardContainer = styled.li`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	border-radius: 1rem;
	border: 1px solid ${colorWhiteFaint};
	padding: 12px 10px;

	@media (min-width: 768px) {
		padding: 20px 30px;
	}
`;
