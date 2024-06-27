import { z } from "zod";

/** Creates a sort schema from a given tuple of keys.
 *  For more type safety, pass the keys as a `const` literal.
 *
 *  @example ```
 *  const schema = createSortSchema([
 *  "currentPrice",
 *  "marketCap",
 *  "usdValue",
 *  ] as const)
 *  ```
 */
export function createSortSchema<
  TKeyPaths extends readonly [string, ...string[]]
>(keyPaths: TKeyPaths) {
  return z.object({
    keyPath: z.enum(keyPaths),
    direction: z.enum(["asc", "desc"]).default("desc"),
  });
}
