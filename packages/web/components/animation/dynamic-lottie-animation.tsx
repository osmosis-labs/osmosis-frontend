import dynamic from "next/dynamic";
import { ComponentProps, FunctionComponent, useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/** Loads the lottie libarary component, and it's
 *  animation data dynamically (outside of the main bundle). */
export const DynamicLottieAnimation: FunctionComponent<
  {
    /** JSON file source, likely a dynamic import: `import("./lottie.json")`. */
    futureLottieContents: Promise<any>;
  } & Omit<ComponentProps<typeof Lottie>, "animationData">
> = (props) => {
  // JSON contents
  const [lottie, setLottie] = useState<any | null>(null);

  // dynamic load JSON animation data
  useEffect(() => {
    if (!lottie) {
      props.futureLottieContents.then(setLottie);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.futureLottieContents]);

  return <Lottie {...props} animationData={null}></Lottie>;
};
