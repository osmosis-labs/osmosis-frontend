import dynamic from "next/dynamic";
import { ComponentProps, FunctionComponent, useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/** Loads the lottie library component, and it's
 *  animation data dynamically (outside of the main bundle). */
export const DynamicLottieAnimation: FunctionComponent<
  {
    /** JSON file source, likely a dynamic import: `import("./lottie.json")`. */
    futureLottieContents: Promise<any>;
  } & Omit<ComponentProps<typeof Lottie>, "animationData">
> = ({ futureLottieContents, ...props }) => {
  // JSON contents
  const [lottie, setLottie] = useState<any | null>(null);

  // dynamic load JSON animation data
  useEffect(() => {
    if (!lottie) {
      futureLottieContents.then(setLottie).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [futureLottieContents]);

  return <Lottie {...props} animationData={lottie}></Lottie>;
};
