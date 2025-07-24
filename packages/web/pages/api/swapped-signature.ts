import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

const publicKey = "pk_live_bf928a1d16cbf9f4e4b1280d87c30dc5";
const secretKey = process.env.SWAPPED_COM_SK;
const currencyCode = "USD";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!secretKey) {
    return res
      .status(500)
      .json({ error: "Swapped.com secret key not provided" });
  }

  const walletAddress = JSON.parse(req.body).walletAddress as string;

  // Build URL with query parameters.
  const originalUrl = `https://widget.swapped.com?apiKey=${publicKey}&currencyCode=${currencyCode}&walletAddress=${walletAddress}`;

  // Create a SHA-256 HMAC signature from the URL's search string, then encode in Base64.
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(new URL(originalUrl).search)
    .digest("base64");

  // Append the URL-encoded signature to the original URL.
  const urlWithSignature = `${originalUrl}&signature=${encodeURIComponent(
    signature
  )}`;

  // Output the final URL with the signature appended.
  res.status(200).json({ url: urlWithSignature });
}
