import dynamic from "next/dynamic";
import { ComponentProps, FunctionComponent, useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const lotties = new Map<string, Record<string, any>>();

/** Dynamically imports a file once per  */
async function loadLottie(
  globalKey: string,
  importFn: () => Promise<Record<string, any>>
) {
  if (!lotties.has(globalKey)) {
    const lottie = await importFn();
    lotties.set(globalKey, lottie);
    return lottie;
  }

  return lotties.get(globalKey);
}

/** Loads the lottie library component, and it's
 *  animation data dynamically (outside of the main bundle). */
export const DynamicLottieAnimation: FunctionComponent<
  {
    globalLottieFileKey: string;
    importFn: () => Promise<Record<string, any>>;
  } & Omit<ComponentProps<typeof Lottie>, "animationData">
> = ({ globalLottieFileKey, importFn, ...props }) => {
  // JSON contents
  const [lottie, setLottie] = useState<any | null>(null);

  // dynamic load JSON animation data
  useEffect(() => {
    if (!lottie) {
      loadLottie(globalLottieFileKey, importFn)
        .then(setLottie)
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalLottieFileKey]);

  return <Lottie {...props} animationData={lottie} />;
};
