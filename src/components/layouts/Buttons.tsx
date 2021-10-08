import styled from '@emotion/styled';
import { colorPrimary200, colorWhiteFaint, colorGold } from 'src/emotionStyles/colors';
import { cssRaiseButtonShadow } from 'src/emotionStyles/forms';

const PaddingBySize = {
	large: `12px 28px`,
	regular: `10px 20px`,
	small: '4px 6px',
};

interface OsmosisButtonProps {
	size?: keyof typeof PaddingBySize;
	isOutlined?: boolean;
}
export const ButtonPrimary = styled.button<OsmosisButtonProps>`
	${({ size = 'regular', isOutlined = false }) => ({
		padding: PaddingBySize[size],
		backgroundColor: isOutlined ? 'transparent' : colorPrimary200,
		border: isOutlined ? `1px solid ${colorPrimary200}` : 'none',
	})};
	border-radius: 0.5rem;
	cursor: pointer;
	line-height: 1;

	&:hover {
		opacity: 0.75;
	}

	&:disabled {
		opacity: 0.5;
	}
`;

export const ButtonSecondary = styled.button<OsmosisButtonProps>`
	${({ size = 'regular', isOutlined = false }) => ({
		padding: PaddingBySize[size],
		backgroundColor: isOutlined ? 'transparent' : colorGold,
		border: isOutlined ? `1px solid ${colorGold}` : 'none',
	})};
	border-radius: 0.5rem;
	cursor: pointer;
	line-height: 1;

	&:hover {
		opacity: 0.75;
	}

	&:disabled {
		opacity: 0.5;
	}
`;

export const ButtonToggle = styled.button<OsmosisButtonProps & { isActive: boolean }>`
	${({ size = 'regular', isActive = false }) => ({
		padding: PaddingBySize[size],
		backgroundColor: isActive ? colorPrimary200 : colorWhiteFaint,
	})};
	border-radius: 0.375rem;
`;

export const ButtonFaint = styled.button`
	background-color: transparent;
	border: 0;
	padding: 0;

	&:hover {
		opacity: 0.5;
	}

	&:disabled {
		opacity: 0.5;
	}
`;

export const CtaButton = styled.button`
	${cssRaiseButtonShadow};
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	border-radius: 1rem;
	background-color: ${colorPrimary200};
	height: 3rem;
	&:hover {
		opacity: 0.75;
	}
	&:disabled {
		opacity: 0.5;
	}

	@media (min-width: 768px) {
		height: 3.75rem;
	}
`;
