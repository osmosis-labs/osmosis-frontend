import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Tippy from '@tippyjs/react';
import { observer } from 'mobx-react-lite';
import React, { HTMLAttributes } from 'react';
import AutosizeInput from 'react-input-autosize';
import { DisplayIcon } from 'src/components/layouts/Sidebar/SidebarItem';
import { Text } from 'src/components/Texts';
import {
	colorError,
	colorGold,
	colorPrimary,
	colorPrimary200,
	colorPrimaryDarker,
	colorWhiteFaint,
	colorWhiteHigh,
} from 'src/emotionStyles/colors';
import { useBooleanStateWithWindowEvent } from 'src/hooks/useBooleanStateWithWindowEvent';
import { SlippageStep } from 'src/pages/main/models/tradeModels';
import { TradeConfig } from 'src/pages/main/stores/trade/config';
import { slippageStepToPercentage } from '../../utils/slippageStepToPercentage';

interface Props {
	config: TradeConfig;
}

export const TradeTxSettings = observer(function TradeTxSettings({ config }: Props) {
	const [isSettingsOpen, setIsSettingsOpen] = useBooleanStateWithWindowEvent(false);

	return (
		<TradeTxSettingsContainer>
			<DisplayIcon
				onClick={event => {
					event.persist();
					event.stopPropagation();
					setIsSettingsOpen(isOpen => !isOpen);
				}}
				isActive={isSettingsOpen}
				icon="/public/assets/Icons/Setting.svg"
				iconSelected="/public/assets/Icons/Setting_selected.svg"
			/>

			<TradeTxSettingsContent
				style={isSettingsOpen ? { position: 'absolute' } : { display: 'none' }}
				onClick={e => e.stopPropagation()}>
				<Text emphasis="high" pb={8}>
					Transaction Settings
				</Text>

				<TxSettingsInfoSection>
					<Text emphasis="low" size="sm" style={{ marginRight: 10 }}>
						Slippage tolerance
					</Text>
					<TippyStyled content="Your transaction will revert if the price changes unfavorably by more than this percentage.">
						<InfoIconText size="xs" color="black">
							!
						</InfoIconText>
					</TippyStyled>
				</TxSettingsInfoSection>

				<SlippageToleranceList>
					{[SlippageStep.Step1, SlippageStep.Step2, SlippageStep.Step3].map(slippageStep => {
						return (
							<SlippageToleranceItem
								key={slippageStep?.toString()}
								onClick={() => config.setSlippageStep(slippageStep)}
								selected={config.slippageStep === slippageStep}>
								{slippageStepToPercentage(slippageStep)}%
							</SlippageToleranceItem>
						);
					})}

					<SlippageToleranceInputItem config={config} />
				</SlippageToleranceList>
			</TradeTxSettingsContent>
		</TradeTxSettingsContainer>
	);
});

const TradeTxSettingsContainer = styled.section`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	position: relative;
	z-index: 10;
`;

const TradeTxSettingsContent = styled.div`
	right: 0;
	top: 0;
	background-color: ${colorPrimary};
	border-width: 1px;
	color: ${colorWhiteFaint};
	border-radius: 1rem;
	padding: 30px;
	margin-top: 64px;
	width: 382px;
	height: 160px;
`;

const TxSettingsInfoSection = styled.div`
	display: flex;
	width: 100%;
	margin-bottom: 12px;
	align-items: center;
`;

const TippyStyled = styled(Tippy)`
	width: 18.75rem;
`;

const InfoIconText = styled(Text)`
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	border-radius: 9999px;
	width: 0.875rem;
	height: 0.875rem;
	background-color: ${colorGold};
`;

const SlippageToleranceList = styled.ul`
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12px;
`;

interface SlippageToleranceItemProps extends HTMLAttributes<HTMLLIElement> {
	selected: boolean;
}

function SlippageToleranceItem({ children, selected, ...props }: SlippageToleranceItemProps) {
	return (
		<SlippageToleranceItemContainer selected={selected} {...props}>
			<Text emphasis="high">{children}</Text>
		</SlippageToleranceItemContainer>
	);
}

const SlippageToleranceItemContainer = styled.li<{ selected: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 2rem;
	cursor: pointer;
	width: 100%;
	border-radius: 20px;
	${({ selected }) => {
		return selected
			? css`
					background-color: ${colorPrimary200};
			  `
			: css`
					background-color: ${colorPrimaryDarker};

					&:hover {
						opacity: 0.75;
					}
			  `;
	}}
`;

const SlippageToleranceInputItem = observer(function SlippageToleranceInputItem({ config }: Props) {
	const selected = config.slippageStep == null;

	const error = selected ? config.getErrorOfSlippage() : undefined;

	return (
		<SlippageToleranceInputItemContainer selected={selected} error={error}>
			<label
				style={{
					display: 'flex',
					width: '100%',
					justifyContent: 'center',
					alignItems: 'center',
					color: selected ? colorWhiteHigh : colorWhiteFaint,
				}}>
				<AutosizeInput
					style={{ textAlign: 'center' }}
					minWidth={config.manualSlippageText === config.initialManualSlippage ? 24 : undefined}
					value={config.manualSlippageText}
					onFocus={e => {
						e.preventDefault();
						config.setSlippageStep(undefined);
					}}
					onChange={e => {
						e.preventDefault();
						const text = e.currentTarget.value;
						config.setSlippage(text);
					}}
				/>
				<span>%</span>
			</label>
		</SlippageToleranceInputItemContainer>
	);
});

const SlippageToleranceInputItemContainer = styled.li<{ selected: boolean; error?: Error }>`
	display: flex;
	width: 100%;
	height: 2rem;
	border-radius: 20px;
	${({ selected, error }) => {
		if (error) {
			return { backgroundColor: colorError };
		}
		return selected ? { backgroundColor: colorPrimary200 } : { backgroundColor: colorPrimaryDarker };
	}}
`;
