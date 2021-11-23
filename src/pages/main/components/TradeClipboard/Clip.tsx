import styled from '@emotion/styled';
import React from 'react';

export function Clip() {
	return (
		<ClipContainer>
			<ClipMiddle />
			<ClipBottom />
		</ClipContainer>
	);
}

const ClipContainer = styled.div`
	background: linear-gradient(180deg, #3a3369 0%, #231d4b 100%);
	position: absolute;
	left: 50%;
	top: -8px;
	transform: translate(-50%, 0);
	box-shadow: 0 2px 2px rgba(11, 16, 38, 0.48);
	overflow: hidden;
	z-index: 2;
	border-radius: 0.375rem;
	height: 41px;
	width: 117px;

	@media (min-width: 768px) {
		height: 60px;
		width: 160px;
	}
`;

const ClipMiddle = styled.div`
	height: 22px;
	width: 36px;
	left: 50%;
	bottom: 5px;
	transform: translate(-50%, 0);
	background: rgba(91, 83, 147, 0.12);
	background-blend-mode: difference;
	position: absolute;
	border-radius: 0.375rem;
	z-index: 10;
	box-shadow: inset 1px 1px 1px rgba(0, 0, 0, 0.25);

	@media (min-width: 768px) {
		height: 30px;
		width: 48px;
		bottom: 7px;
	}
`;

const ClipBottom = styled.div`
	position: absolute;
	width: 100%;
	height: 16px;
	left: 50%;
	bottom: 0;
	transform: translate(-50%, 0);
	background: linear-gradient(180deg, #332c61 0%, #312a5d 10.94%, #2d2755 100%);
	z-index: 0;
	border-bottom-right-radius: 0.375rem;
	border-bottom-left-radius: 0.375rem;

	@media (min-width: 768px) {
		height: 20px;
	}
`;
