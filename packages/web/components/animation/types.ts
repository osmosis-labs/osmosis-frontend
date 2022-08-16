import type { LottieProps } from "react-lottie";

export type Animation = Pick<
  LottieProps,
  "direction" | "isClickToPauseDisabled" | "isStopped" | "isPaused"
>;
