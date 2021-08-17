import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Img } from 'src/components/common/Img';
import { ButtonFaint, ButtonPrimary } from 'src/components/layouts/Buttons';
import { CenterV } from 'src/components/layouts/Containers';
import { TokenSelect } from 'src/components/SwapToken/TokenSelect';
import { Text, TitleText } from 'src/components/Texts';
import { colorBlack, colorFilterWhiteHigh, colorGold, colorWhiteFaint } from 'src/emotionStyles/colors';
import { cssAlignRightInput, cssNumberTextInput } from 'src/emotionStyles/forms';
import { cssFontPoppins } from 'src/emotionStyles/texts';
import { CreateNewPoolConfig } from './index';

interface Props {
	config: CreateNewPoolConfig;
	close: () => void;
}

export const NewPoolStage1 = observer(function NewPoolStage1({ config, close }: Props) {
	const hasMoreTokens = config.assets.length < 8 && config.remainingSelectableCurrencies.length > 0;

	const handleAddTokenClicked = () => {
		if (!hasMoreTokens) {
			return;
		}
		const currency = config.remainingSelectableCurrencies[0];
		config.addAsset(currency);
	};

	return (
		<>
			<CreateNewPoolHeadSection>
				<HeadTitle>
					<TitleText pb={0}>Create New Pool</TitleText>
					<ButtonFaint onClick={close}>
						<CloseIcon />
					</ButtonFaint>
				</HeadTitle>
				<HeadSubTitle>
					<Text size="sm" emphasis="medium">
						Step 1/3 - Set token ratio
					</Text>
				</HeadSubTitle>
			</CreateNewPoolHeadSection>

			<AddedTokenList shouldShowScroll={config.assets.length > 4}>
				{config.assets.map((asset, i) => {
					return <NewPool key={asset.amountConfig.currency.coinMinimalDenom} config={config} assetAt={i} />;
				})}
			</AddedTokenList>

			{hasMoreTokens && (
				<AddTokenSection onClick={handleAddTokenClicked}>
					<CenterV>
						<AddButton>
							<Img
								style={{ width: '1.75rem', height: '1.75rem', filter: `brightness(0%) invert(100%)` }}
								src="/public/assets/Icons/Add.svg"
							/>
						</AddButton>
						<TitleText pb={0}>Add new token</TitleText>
					</CenterV>
				</AddTokenSection>
			)}
		</>
	);
});

const CreateNewPoolHeadSection = styled.div`
	padding-left: 18px;
`;

const HeadTitle = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 18px;
`;

const HeadSubTitle = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
`;

const CloseIcon = styled(Img)`
	width: 1.5rem;
	height: 1.5rem;
`;
CloseIcon.defaultProps = { src: '/public/assets/Icons/X.svg' };

const AddedTokenList = styled.ul<{ shouldShowScroll: boolean }>`
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 20px;
	${({ shouldShowScroll }) => (shouldShowScroll ? { overflowY: 'auto', paddingBottom: 140 } : null)};
	max-height: 430px;
`;

const AddTokenSection = styled.div`
	padding-top: 24px;
	padding-bottom: 30px;
	padding-left: 28px;
	margin-top: 10px;
	border: 1px solid ${colorWhiteFaint};
	border-radius: 1rem;
	cursor: pointer;

	&:hover {
		border-color: ${colorGold};
	}
`;

const AddButton = styled(ButtonPrimary)`
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 20px;
	padding: 0;
	width: 2.25rem;
	height: 2.25rem;
	border-radius: 50%;
`;

interface NewPoolProps {
	config: CreateNewPoolConfig;
	assetAt: number;
}

export const NewPool = observer(function NewPool({ config, assetAt }: NewPoolProps) {
	const asset = config.assets[assetAt];

	return (
		<NewPoolContainer>
			<TokenSelect
				channelShown={true}
				options={config.remainingSelectableCurrencies}
				value={asset.amountConfig.currency}
				onSelect={appCurrency => {
					const currency = config.remainingSelectableCurrencies.find(
						cur => cur.coinMinimalDenom === appCurrency.coinMinimalDenom
					);
					if (currency) {
						asset.amountConfig.setCurrency(currency);
					}
				}}
				dropdownStyle={{
					left: -19,
					width: 592,
					borderLeft: `1px solid ${colorWhiteFaint}`,
					borderRight: `1px solid ${colorWhiteFaint}`,
					borderBottom: `1px solid ${colorWhiteFaint}`,
					borderBottomLeftRadius: '1rem',
					borderBottomRightRadius: '1rem',
				}}
			/>
			<CenterV className="flex items-center">
				<ButtonFaint
					onClick={() => {
						config.removeAssetAt(assetAt);
					}}>
					<CloseIcon
						src="/public/assets/Icons/Close.svg"
						style={{ marginRight: 16, width: '2rem', height: '2rem', filter: colorFilterWhiteHigh }}
					/>
				</ButtonFaint>
				<PercentInput
					type="number"
					onChange={e => {
						config.setAssetPercentageAt(assetAt, e.currentTarget.value);
					}}
					value={asset.percentage}
				/>
				<TitleText pb={0}>%</TitleText>
			</CenterV>
		</NewPoolContainer>
	);
});

const NewPoolContainer = styled.li`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 18px 28px 24px 18px;
	border: 1px solid ${colorWhiteFaint};
	border-radius: 1rem;
	position: relative;
`;

const PercentInput = styled.input`
	background-color: ${colorBlack};
	${cssNumberTextInput};
	${cssAlignRightInput};
	${cssFontPoppins};
	padding-top: 6px;
	padding-bottom: 6px;
	border-radius: 0.5rem;
	height: 2.25rem;
	margin-right: 10px;
	padding-right: 6px;
	border-width: 1px;
	border-color: transparent;
	font-size: 20px;

	&:focus {
		border-color: ${colorGold};
	}

	max-width: 130px;
`;
