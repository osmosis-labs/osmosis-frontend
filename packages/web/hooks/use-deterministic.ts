import { sha256 } from "sha.js";
import { Buffer } from "buffer";
import { useMemo } from "react";

/**
 * useDeterministicIntegerFromString returns the deterministic 32bit integer from string
 * @param str
 */
export const useDeterministicIntegerFromString = (str: string) => {
  return useMemo(() => {
    const buf = Buffer.from(str);

    const hashed = new sha256().update(buf).digest();

    return (
      (hashed[0] | (hashed[1] << 8) | (hashed[2] << 16) | (hashed[3] << 24)) >>>
      0
    );
  }, [str]);
};
