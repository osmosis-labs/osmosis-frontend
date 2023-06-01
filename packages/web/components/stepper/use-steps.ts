import { useCallback } from "react";

import { useControllableState } from "~/hooks/use-controllable-state";

export interface UseStepsProps {
  index?: number;
  count: number;
}

export default function useSteps(props: UseStepsProps) {
  const { index, count } = props;

  const [activeStep, _setActiveStep] = useControllableState({
    defaultValue: 0,
    value: index,
  });

  const maxStep = typeof count === "number" ? count - 1 : 0;

  const setActiveStep = useCallback(
    (nextStep: number | ((nextStep: number) => number)) =>
      _setActiveStep((currentStep) => {
        const nextValue =
          typeof nextStep === "function" ? nextStep(currentStep) : nextStep;

        if (nextValue === currentStep) return currentStep;
        if (nextValue < 0 || nextValue > maxStep) return currentStep;

        return nextValue;
      }),
    [_setActiveStep, maxStep]
  );

  const nextStep = useCallback(() => {
    setActiveStep((currentStep) => currentStep + 1);
  }, [setActiveStep]);

  const previousStep = useCallback(() => {
    setActiveStep((currentStep) => currentStep - 1);
  }, [setActiveStep]);

  return {
    nextStep,
    previousStep,
    activeStep,
    setActiveStep,
    totalSteps: count,
  };
}

export type UseStepsReturn = ReturnType<typeof useSteps>;
