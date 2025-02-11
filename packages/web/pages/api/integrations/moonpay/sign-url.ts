import { MoonPay } from "@moonpay/moonpay-node";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Signs a MoonPay URL for client side usage as specified in https://dev.moonpay.com/docs/on-ramp-enhance-security-using-signed-urls
 */
export default async function signMoonPayUrl(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method not allowed" });
  }
  if (!process.env.MOONPAY_PRIVATE_KEY) {
    return res.status(500).send({ error: "Moonpay private key not set" });
  }

  const moonPay = new MoonPay(process.env.MOONPAY_PRIVATE_KEY);
  const { url: moonPayUrl } = await req.body;

  if (!moonPayUrl) {
    return res.status(400).send({ error: "Moonpay url not provided" });
  }

  try {
    const signature = moonPay.url.generateSignature(moonPayUrl);

    if (!signature) {
      return res.status(500).send({ error: "Failed to generate signature" });
    }

    return res.status(200).send({ signature });
  } catch (e) {
    return res
      .status(500)
      .send({ error: "An unexpected error occurred. Please try again." });
  }
}
