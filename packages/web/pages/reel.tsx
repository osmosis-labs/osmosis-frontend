import { Step, Stepper } from "~/components/stepper";

const Reel = () => {
  return (
    <Stepper autoplay={{ delay: 4000, stopOnHover: true }}>
      <Step>test 1</Step>
      <Step>test 2</Step>
      <Step>test 3</Step>
    </Stepper>
  );
};

export default Reel;
