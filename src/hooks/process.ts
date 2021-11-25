import bind from 'lodash/bind';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import findLast from 'lodash/findLast';
import { useEffect, useState } from 'react';

// fields that are allowed to change
export interface StepUpdate {
	hash?: string;
	info?: string;
	status: string;
	error?: Error;
}
// fields that are not allowed to change
export interface Step extends StepUpdate {
	type: string;
}

export interface Process {
	active: boolean;
	success: boolean;
	current: Step | null;
	steps: Step[];
	start: () => void;
	addStep: (step: Step) => (update: StepUpdate) => void;
	/** Run a function and update the step (with success or error) */
	trackStep: (step: Step, func: (updateStep: (update: StepUpdate) => void) => Promise<void>) => any;
	setSuccessful: () => void;
	setInactive: () => void;
	reset: () => void;
}

export function useProcess(): Process {
	const [active, setActive] = useState(false);
	const [success, setSuccessful] = useState(false);
	const [steps, setSteps] = useState<Step[]>([]);
	// const { library } = useActiveWeb3React();

	const reset = () => {
		setActive(false);
		setSuccessful(false);
		setSteps([]);
	};
	const start = () => {
		if (active) throw new Error('Already active');
		reset();
		setActive(true);
	};

	const updateStep = (type: string, update: StepUpdate) =>
		setSteps(steps => {
			const index = findIndex(steps, { type });
			if (index === -1) {
				console.error("Step update failed, as the step doesn't exist anymore", type, steps, update);
			} else {
				console.log('Updating step', index, steps, update);
				steps[index] = { ...steps[index], ...update };
			}
			return Array.from(steps); // trigger hook update
		});

	const addStep = (step: Step) => {
		if (find(steps, { type: step.type })) throw new Error('duplicate type: ' + step.type);
		setSteps(steps => [...steps, step]);
		return bind(updateStep, null, step.type);
	};
	const trackStep = async (step: Step, func: (updateStep: (update: StepUpdate) => void) => Promise<void>) => {
		const updateStep = addStep(step);
		try {
			await func(updateStep);
			updateStep({ status: 'success' });
		} catch (error) {
			updateStep({ status: 'error', error });
			throw error;
		}
	};

	return {
		start,
		active,
		success,
		current: findLast(steps, s => !s.status || (s.status !== 'success' && !s.status.endsWith('error'))) ?? null,
		steps,
		addStep,
		trackStep,
		setInactive: () => {
			setActive(false);
		},
		setSuccessful: () => {
			setSuccessful(true);
			setActive(false);
		},
		reset,
	};
}
