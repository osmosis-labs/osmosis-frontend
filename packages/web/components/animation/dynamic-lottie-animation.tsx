import type { LottieSvgProps } from "lottie-react";
import dynamic from "next/dynamic";
import { FunctionComponent, useEffect, useState } from "react";

// The svg build carries one renderer and keeps the expression engine, which
// step1.json relies on.
const Lottie = dynamic<LottieSvgProps>(
  () => import("lottie-react").then((module) => module.LottieSvg),
  { ssr: false }
);

const lotties = new Map<string, Promise<Record<string, any>>>();

/** Dynamically imports an animation file once per global key. Concurrent
 *  mounts with the same key share the in-flight import. */
function loadLottie(
  globalKey: string,
  importFn: () => Promise<Record<string, any>>
) {
  let lottie = lotties.get(globalKey);
  if (!lottie) {
    lottie = importFn().then(
      (animationModule) => animationModule.default ?? animationModule
    );
    // Forget failed imports so a later mount can retry.
    lottie.catch(() => lotties.delete(globalKey));
    lotties.set(globalKey, lottie);
  }
  return lottie;
}

/** Loads the lottie library component, and its
 *  animation data dynamically (outside of the main bundle). */
export const DynamicLottieAnimation: FunctionComponent<
  {
    globalLottieFileKey: string;
    importFn: () => Promise<Record<string, any>>;
  } & Omit<LottieSvgProps, "src">
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

  // v3 requires a valid source, so the player cannot mount before the JSON has
  // loaded. Keep the caller's sized, interactive box in place meanwhile.
  if (!lottie || lottie.key !== globalLottieFileKey) {
    const { className, style, onMouseEnter, onMouseLeave } = props;
    return (
      <div
        className={className}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    );
  }

  // v3 defaults both to false, unlike the previous lottie-web-backed defaults.
  return (
    <Lottie {...props} src={lottie.data} autoplay={autoplay} loop={loop} />
  );
};
