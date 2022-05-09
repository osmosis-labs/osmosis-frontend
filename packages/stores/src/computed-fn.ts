import { computedFn as originalComputedFn } from "mobx-utils";
import { isUsingStaticRendering } from "mobx-react-lite"; /* or lite, pending your setup */

// see: https://github.com/mobxjs/mobx-utils/issues/278

/** Wrapper around `mobx-utils` computed fn to allow 0-warning SSR. */
// eslint-ignore
export function computedFn<F extends (...args: any[]) => any>(fn: F): F {
  return isUsingStaticRendering() ? fn : originalComputedFn(fn);
}
