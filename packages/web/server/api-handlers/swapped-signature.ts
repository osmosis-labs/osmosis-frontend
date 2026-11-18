import { readBodyText } from "~/server/api-handlers/request-body";
import {
  parseSwappedSignRequestBody,
  signSwappedUrl,
  SwappedSignUrlError,
} from "~/server/integrations/swapped/sign-swapped-url";

export async function swappedSignatureHandler(req: Request) {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const secretKey = process.env.SWAPPED_COM_SK;
  if (!secretKey) {
    return Response.json(
      { error: "Swapped.com secret key not provided" },
      { status: 500 }
    );
  }

  const body = await readBodyText(req);
  if (body === undefined) {
    return Response.json({ error: "Request too large" }, { status: 413 });
  }

  try {
    // Parses the raw text itself, answering malformed JSON with a 400.
    const { walletAddress } = parseSwappedSignRequestBody(body);
    const { url } = signSwappedUrl(walletAddress, secretKey);

    return Response.json({ url });
  } catch (error) {
    if (error instanceof SwappedSignUrlError) {
      return Response.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
