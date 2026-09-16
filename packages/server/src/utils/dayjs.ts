// create a module with dayjs and duration plugin extended

import dayjsLib from "dayjs";
import duration from "dayjs/plugin/duration";

dayjsLib.extend(duration);

// Named `const` so webpack compiling workspace `src` emits a real export.
// `export { dayjs }` of a CJS default import is dropped.
export const dayjs = dayjsLib;
