import classNames from "classnames";
import {
  Children,
  FC,
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from "react";

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

const Step: FunctionComponent<{ className?: string }> = (props) => {
  const { activeStep } = useStepperContext();
  const { index } = useStepContext();

  const isActive = activeStep === index;

  return (
    <div
      {...props}
      className={classNames(
        {
          "pointer-events-auto relative z-10 opacity-100": isActive,
          hidden: !isActive,
        },
        "animate-[fadeIn_0.3s_ease-in-out_0s]",
        props?.className
      )}
    />
  );
};

Step.defaultProps = {
  // @ts-ignore
  // __TYPE is used to identify 'Step' components when filtering child components in the 'Stepper' component.
  __TYPE: "Step",
};

export const StepsIndicator: FC = () => {
  const { activeStep, totalSteps, setActiveStep } = useStepperContext();

  return (
    <div className="flex items-center justify-center gap-5">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <button
          key={index}
          onClick={() => {
            setActiveStep(index);
          }}
          className={classNames(
            "mx-1 h-2 w-2 rounded-full",
            index === activeStep
              ? "bg-osmoverse-500"
              : "bg-osmoverse-300 dark:bg-osmoverse-700"
          )}
        />
      ))}
    </div>
  );
};

/**
 * The Stepper component is a UI element that can be used to display content sequentially.
 * It is an ideal choice for constructing features like slideshows, reels, or wizards where
 * step-by-step navigation is required.
 *
 * It includes an autoplay feature, which allows automatic progression to the
 * next step after a specified delay, providing a smooth, hands-free navigation experience.
 *
 * The Stepper is a headless component and requires multiple children to work:
 *  - the `Step` serves to identify and render individual steps within the Stepper.
 *    Each instance of Step corresponds to one stage in the sequential navigation.
 *  - the `StepsIndicator` is responsible for generating a series of navigation buttons.
 *    These buttons allow users to manually move between steps, granting a high level of navigational control.
 *
 * @example
 * <Stepper autoplay={{ delay: 4000, stopOnHover: true }}>
 *  <Step>
 *   <h4>Heading</h4>
 *   <div className="h-12 w-12 bg-osmoverse-500"></div>
 *   <p>test 1</p>
 *  </Step>
 *  <Step>
 *   <p>test 2</p>
 *  </Step>
 *  <StepsIndicator />
 * </Stepper>
 */
const Stepper: FC<{
  autoplay?: {
    delay: number;
    stopOnLastSlide?: boolean;
    isStopped?: boolean;
    stopOnHover?: boolean;
  };
}> = (props) => {
  const { children, autoplay } = props;

  const stepElements = Children.toArray(children).filter((child) => {
    if (!child) return false;
    return (child as ReactElement)?.props?.__TYPE === "Step";
  });

  const otherElements = Children.toArray(children).filter((child) => {
    if (!child) return false;
    return (child as ReactElement)?.props?.__TYPE !== "Step";
  });

  const context = useSteps({ count: stepElements.length });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (autoplay && Boolean(autoplay?.delay)) {
      const interval = setInterval(() => {
        // Stop autoplay if it's set to stop on hover and the user is hovering.
        if (autoplay?.stopOnHover && isHovering) {
          return;
        }

        if (autoplay?.isStopped) {
          return;
        }

        // Stop autoplay if it's set to stop on the last slide.
        if (
          autoplay?.stopOnLastSlide &&
          context.activeStep === context.totalSteps - 1
        ) {
          clearInterval(interval);
          return;
        }

        // If the active step is the last step and it should not stop on last slide, go back to the first step.
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
      {otherElements}
    </StepperContextProvider>
  );
};

export { Step, Stepper, useStepContext, useStepperContext };
