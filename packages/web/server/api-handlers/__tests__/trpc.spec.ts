/**
 * @jest-environment node
 */
import { MAX_JSON_BODY_BYTES } from "~/server/api-handlers/request-body";
import { trpcHandler } from "~/server/api-handlers/trpc";

describe("trpcHandler", () => {
  it("refuses a mutation body over the size limit with a 413", async () => {
    const response = await trpcHandler(
      new Request("https://app.test/api/trpc/local.example", {
        method: "POST",
        body: "x".repeat(MAX_JSON_BODY_BYTES + 1),
      })
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "Request too large" });
  });

  it("hands a body within the limit to tRPC", async () => {
    const response = await trpcHandler(
      new Request("https://app.test/api/trpc/no.such.procedure", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    // tRPC itself answers: the procedure does not exist.
    expect(response.status).toBe(404);
  });
});
