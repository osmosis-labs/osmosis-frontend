import classNames from "classnames";
import {
  Children,
  FunctionComponent,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createContext } from "~/utils/react-context";

import useSteps, { UseStepsReturn } from "./use-steps";

interface StepsProps {
  autoplay?: {
    delayInMs: number;
    stopOnLastSlide?: boolean;
    isStopped?: boolean;
    stopOnHover?: boolean;
  };
}

const [StepperContextProvider, useStepperContext] = createContext<
  UseStepsReturn & StepsProps & { isStopped: boolean }
>({
  name: "Stepper",
});

const [StepContextProvider, useStepContext] = createContext<{
  index: number;
}>({
  name: "Step",
});

const Step: FunctionComponent<{
  className?: string;
  /**
   * Do not overwrite this property without modifying Stepper.
   * It's needed to filter step elements in Stepper.
   */
  __TYPE?: string;
}> = (props) => {
  const { activeStep } = useStepperContext();
  const { index } = useStepContext();

  const isActive = activeStep === index;

  const { __TYPE, ...rest } = props;

  return (
    <div
      {...rest}
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

export const StepsIndicator: FunctionComponent<{
  mode?: "pills" | "dots";
}> = ({ mode = "dots" }) => {
  const { activeStep, totalSteps, setActiveStep, autoplay, isStopped } =
    useStepperContext();

  if (mode === "pills") {
    return (
      <div className="flex items-center justify-center gap-5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index === activeStep;

          return (
            <button
              key={index}
              onClick={() => {
                setActiveStep(index);
              }}
              className={classNames(
                "relative h-1 w-full max-w-[66px] overflow-hidden rounded-sm bg-osmoverse-700",
                index < activeStep ? "bg-osmoverse-100" : "bg-osmoverse-700"
              )}
            >
              <span className="sr-only">{`Step ${index + 1}`}</span>
              {isActive && (
                <span
                  className="absolute inset-0 -translate-x-full transform rounded-sm bg-osmoverse-100"
                  style={{
                    animationName: "transformInitial",
                    animationDuration: `${autoplay?.delayInMs ?? 0}ms`,
                    animationTimingFunction: "ease-in-out",
                    animationFillMode: "forwards",
                    animationPlayState: isStopped ? "paused" : "running",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

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
            index === activeStep ? "bg-osmoverse-500" : "bg-osmoverse-700"
          )}
        >
          <span className="sr-only">{`Step ${index + 1}`}</span>
        </button>
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
 * <Stepper autoplay={{ delayInMs: 4000, stopOnHover: true }}>
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
const Stepper: FunctionComponent<StepsProps> = (props) => {
  const { children, autoplay } = props;

  const timerTimeInMs = useRef(0);

  const stepElements = Children.toArray(children).filter((child) => {
    if (!child) return false;
    return (child as ReactElement)?.props?.__TYPE === "Step";
  });

  const otherElements = Children.toArray(children).filter((child) => {
    if (!child) return false;
    return (child as ReactElement)?.props?.__TYPE !== "Step";
  });

  const stepsContext = useSteps({ count: stepElements.length });
  const [isHovering, setIsHovering] = useState(false);

  const isStopped = useMemo(
    () => (autoplay?.stopOnHover && isHovering) || Boolean(autoplay?.isStopped),
    [autoplay?.isStopped, autoplay?.stopOnHover, isHovering]
  );

  useEffect(() => {
    if (autoplay && Boolean(autoplay?.delayInMs)) {
      const IntervalTimeIncrements = 1000;
      const interval = setInterval(() => {
        if (isStopped) {
          return;
        }

        timerTimeInMs.current += IntervalTimeIncrements;

        if (timerTimeInMs.current < autoplay.delayInMs) {
          return;
        }

        // Stop autoplay if it's set to stop on the last slide.
        if (
          autoplay?.stopOnLastSlide &&
          stepsContext.activeStep === stepsContext.totalSteps - 1
        ) {
          clearInterval(interval);
          timerTimeInMs.current = 0;
          return;
        }

        // If the active step is the last step and it should not stop on last slide, go back to the first step.
        if (stepsContext.activeStep === stepsContext.totalSteps - 1) {
          stepsContext.setActiveStep(0);
          timerTimeInMs.current = 0;
          return;
        }

        stepsContext.nextStep();
        timerTimeInMs.current = 0;
      }, IntervalTimeIncrements);

      return () => {
        clearInterval(interval);
      };
    }
  }, [autoplay, stepsContext, isHovering, isStopped]);

  const context = useMemo(
    () => ({
      ...stepsContext,
      autoplay,
      isStopped,
    }),
    [autoplay, isStopped, stepsContext]
  );

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
