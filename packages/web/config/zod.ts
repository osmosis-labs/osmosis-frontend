import { z } from "zod";

// Skip zod v4's JIT `new Function` probe: it is caught, but still reported as a
// CSP `unsafe-eval` violation on every page load. Parsing falls back to the
// interpreter, which is plenty fast for our schemas.
//
// This must run before any `z.object(...)` is constructed, since the probe runs
// (and is cached) at schema construction. Import this module first in `_app`.
// It is listed in package.json `sideEffects`, or webpack would drop the import.
z.config({ jitless: true });
