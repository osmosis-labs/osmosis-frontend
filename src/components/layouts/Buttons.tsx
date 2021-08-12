import styled from '@emotion/styled';
import { colorPrimary200, colorWhiteFaint } from 'src/emotionStyles/colors';
import { cssRaiseButtonShadow } from 'src/emotionStyles/forms';

const PaddingBySize = {
	large: `12px 28px`,
	regular: `10px 20px`,
	small: '4px 6px',
};

interface OsmosisButtonProps {
	size?: keyof typeof PaddingBySize;
}
export const ButtonPrimary = styled.button<OsmosisButtonProps>`
	${({ size = 'regular' }) => `padding: ${PaddingBySize[size]}`};
	border-radius: 0.5rem;
	background-color: ${colorPrimary200};
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
	height: 3.75rem;
	&:hover {
		opacity: 0.75;
	}
	&:disabled {
		opacity: 0.5;
	}
`;
