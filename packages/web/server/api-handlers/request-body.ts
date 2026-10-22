/** Body limit for handlers that read JSON, matching the 1MB default of
 *  Next's API body parser, which these routes used before taking the raw
 *  request. */
export const MAX_JSON_BODY_BYTES = 1024 * 1024;

/** The body as text, or undefined when it is larger than `maxBytes` UTF-8
 *  bytes. A declared oversize body is refused before it is read, and reading
 *  stops once the bytes received pass the limit, so neither a chunked body
 *  nor a false `content-length` gets more than `maxBytes` into memory. */
export async function readBodyText(
  req: Request,
  maxBytes = MAX_JSON_BODY_BYTES
): Promise<string | undefined> {
  const declaredLength = Number(req.headers.get("content-length"));
  if (declaredLength > maxBytes) return undefined;
  if (!req.body) return "";

  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();

      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        // Stops the upload instead of leaving the platform to drain it. The
        // 413 still reaches the client under `toNodeApiHandler` (see
        // `fetch-api-handler.spec.ts`).
        await reader.cancel();
        return undefined;
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

/** The parsed JSON body, or the error response to return instead. */
export async function readJsonBody<T>(
  req: Request
): Promise<{ body: T } | { errorResponse: Response }> {
  const text = await readBodyText(req);
  if (text === undefined) {
    return {
      errorResponse: Response.json(
        { error: "Request too large" },
        { status: 413 }
      ),
    };
  }

  try {
    return { body: JSON.parse(text) as T };
  } catch {
    return {
      errorResponse: Response.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}
