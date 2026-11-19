import { captureError } from "@osmosis-labs/server";
import type { TRPCError } from "@trpc/server";

/** Errors that are the caller's fault, not ours: expected traffic, not worth a log line. */
const CLIENT_ERROR_CODES = new Set<TRPCError["code"]>([
  "BAD_REQUEST",
  "PARSE_ERROR",
  "NOT_FOUND",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "METHOD_NOT_SUPPORTED",
  "PAYLOAD_TOO_LARGE",
  "TOO_MANY_REQUESTS",
  "CLIENT_CLOSED_REQUEST",
]);

/** Keeps only the origin of URLs in a message: upstream URLs can carry API keys in their
 *  path or query (e.g. EVM RPC endpoints). */
export function redactUrls(message: string): string {
  return message.replace(/https?:\/\/[^\s"'<>]+/g, (url) => {
    try {
      return `${new URL(url).origin}/…`;
    } catch {
      return "<url>";
    }
  });
}

/** tRPC `onError` for every API handler. In production it logs server-side failures (and
 *  procedure timeouts) as one JSON line, so Workers Logs can count and alert on them by
 *  procedure. Without it a failing procedure only shows up as a 500 in the access log. */
export function onTrpcError({
  path,
  error,
}: {
  path?: string;
  error: TRPCError;
}): void {
  if (process.env.NODE_ENV === "development") {
    captureError(error);
    console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
    return;
  }
  if (CLIENT_ERROR_CODES.has(error.code)) return;

  console.error(
    JSON.stringify({
      event: "trpc_error",
      path: path ?? null,
      code: error.code,
      message: redactUrls(error.message),
      cause: error.cause?.name ?? null,
    })
  );
}
