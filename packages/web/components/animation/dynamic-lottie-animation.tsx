import type { LottieProps } from "lottie-react";
import dynamic from "next/dynamic";
import { FunctionComponent, useEffect, useState } from "react";

const Lottie = dynamic<LottieProps>(
  () => import("lottie-react").then((module) => module.Lottie),
  { ssr: false }
);

const lotties = new Map<string, Record<string, any>>();

/** Dynamically imports an animation file once per global key. */
async function loadLottie(
  globalKey: string,
  importFn: () => Promise<Record<string, any>>
) {
  if (!lotties.has(globalKey)) {
    const animationModule = await importFn();
    const lottie = animationModule.default ?? animationModule;
    lotties.set(globalKey, lottie);
    return lottie;
  }

  return lotties.get(globalKey);
}

/** Loads the lottie library component, and its
 *  animation data dynamically (outside of the main bundle). */
export const DynamicLottieAnimation: FunctionComponent<
  {
    globalLottieFileKey: string;
    importFn: () => Promise<Record<string, any>>;
  } & Omit<LottieProps, "src">
> = ({
  globalLottieFileKey,
  importFn,
  autoplay = true,
  loop = true,
  ...props
}) => {
  const [lottie, setLottie] = useState<{
    key: string;
    data: Record<string, any>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadLottie(globalLottieFileKey, importFn)
      .then((data) => {
        if (!cancelled && data) {
          setLottie({ key: globalLottieFileKey, data });
        }
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
    // Callers supply inline import functions; the global key identifies the file.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalLottieFileKey]);

  // v3 requires a valid source; do not mount its player before JSON has loaded.
  if (!lottie || lottie.key !== globalLottieFileKey) return null;

  // v3 defaults both to false, unlike the previous lottie-web-backed defaults.
  return (
    <Lottie {...props} src={lottie.data} autoplay={autoplay} loop={loop} />
  );
};
