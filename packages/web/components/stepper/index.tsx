import classNames from "classnames";
import { Children, FC, useEffect, useState } from "react";

import { createContext } from "~/utils/react-context";

import useSteps, { UseStepsReturn } from "./use-steps";

const [StepperContextProvider, useStepperContext] =
  createContext<UseStepsReturn>({
    name: "Stepper",
  });

const [StepContextProvider, useStepContext] = createContext<{
  index: number;
}>({
  name: "Step",
});

const Step: FC<{ className?: string }> = (props) => {
  const { activeStep } = useStepperContext();
  const { index } = useStepContext();

  const isActive = activeStep === index;

  return (
    <div
      {...props}
      className={classNames(
        {
          "pointer-events-auto relative z-10 opacity-100": isActive,
          "pointer-events-none absolute top-0 z-0 opacity-0": !isActive,
        },
        props?.className
      )}
    />
  );
};

const Stepper: FC<{
  autoplay?: {
    delay: number;
    stopOnLastSlide?: boolean;
    isStopped?: boolean;
    stopOnHover?: boolean;
  };
}> = (props) => {
  const { children, autoplay } = props;

  const stepElements = Children.toArray(children);
  const context = useSteps({ count: stepElements.length });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (autoplay && Boolean(autoplay?.delay)) {
      const interval = setInterval(() => {
        if (autoplay?.stopOnHover && isHovering) {
          return;
        }

        if (autoplay?.isStopped) {
          return;
        }

        if (
          autoplay?.stopOnLastSlide &&
          context.activeStep === context.totalSteps - 1
        ) {
          clearInterval(interval);
          return;
        }

        if (context.activeStep === context.totalSteps - 1) {
          context.setActiveStep(0);
          return;
        }

        context.nextStep();
      }, autoplay.delay);

      return () => {
        clearInterval(interval);
      };
    }
  }, [autoplay, context, isHovering]);

  return (
    <StepperContextProvider value={context}>
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {stepElements.map((child, index) => (
          <StepContextProvider
            key={index}
            value={{
              index,
            }}
          >
            {child}
          </StepContextProvider>
        ))}
      </div>
    </StepperContextProvider>
  );
};

export { Step, Stepper, useStepContext, useStepperContext };
