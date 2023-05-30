import { Step, Stepper, StepsIndicator } from "~/components/stepper";

const Reel = () => {
  return (
    <div className="w-fit">
      <Stepper autoplay={{ delay: 4000, stopOnHover: true }}>
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
        <StepsIndicator />
      </Stepper>
    </div>
  );
};

export default Reel;
