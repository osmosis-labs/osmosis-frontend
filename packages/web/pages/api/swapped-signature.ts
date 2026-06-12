import { NextApiRequest, NextApiResponse } from "next";

import {
  parseSwappedSignRequestBody,
  signSwappedUrl,
  SwappedSignUrlError,
} from "~/server/integrations/swapped/sign-swapped-url";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.SWAPPED_COM_SK;
  if (!secretKey) {
    return res
      .status(500)
      .json({ error: "Swapped.com secret key not provided" });
  }

  try {
    const { walletAddress } = parseSwappedSignRequestBody(req.body);
    const { url } = signSwappedUrl(walletAddress, secretKey);

    return res.status(200).json({ url });
  } catch (error) {
    if (error instanceof SwappedSignUrlError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Malformed JSON request body" });
    }

    return res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again." });
  }
}
