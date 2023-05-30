import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";

const Reel = () => {
  return (
    <div className="relative w-fit">
      <Stepper autoplay={{ delayInMs: 4000, stopOnHover: true }}>
        <StepperLeftChevronNavigation className="absolute left-0 top-1/2 z-50" />
        <Step>
          <h4>Heading</h4>
          <div className="h-12 w-12 bg-osmoverse-500"></div>
          <p>test 1</p>
        </Step>
        <Step>
          <h4>Heading</h4>
          <div className="h-12 w-12 bg-osmoverse-500"></div>
          <p>test 2</p>
        </Step>
        <Step>
          <h4>Heading</h4>
          <div className="h-12 w-12 bg-osmoverse-500"></div>
          <p>test 3</p>
        </Step>
        <StepperRightChevronNavigation className="absolute right-0 top-1/2 z-50" />
        <StepsIndicator mode="pills" />
      </Stepper>
    </div>
  );
};

export default Reel;
