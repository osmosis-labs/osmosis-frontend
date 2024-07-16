import { ApiClientError } from "@osmosis-labs/utils";
import { z } from "zod";

const SquidErrors = z.object({
  errors: z.array(
    z.object({
      errorType: z.string(),
      message: z.string(),
    })
  ),
});

type SquidErrors = z.infer<typeof SquidErrors>;

/**
 * Squid returns error data in the form of an errors object containing an array of errors.
 * This function returns the list of those errors, and sets the Error.message to a concatenation of those errors.
 * @returns list of error messages
 */
export function getSquidErrors(error: ApiClientError): SquidErrors {
  const e = error as ApiClientError<SquidErrors>;
  const squidError = SquidErrors.parse(e.data);
  const msgs = squidError.errors.map(({ message }) => message);
  e.message = msgs.join(", ");
  return squidError;
}
