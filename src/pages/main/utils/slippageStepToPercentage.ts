import { SlippageStep } from '../models/tradeModels';

export function slippageStepToPercentage(step: SlippageStep) {
	switch (step) {
		case SlippageStep.Step1:
			return 1;
		case SlippageStep.Step2:
			return 3;
		case SlippageStep.Step3:
			return 5;
	}
}
