import { useEffect, useLayoutEffect } from "react";
import { isBrowser } from "../utils/ssr";

export const useIsomorphicLayoutEffect = isBrowser
  ? useLayoutEffect
  : useEffect;
