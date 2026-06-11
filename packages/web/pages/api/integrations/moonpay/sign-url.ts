import { NextApiRequest, NextApiResponse } from "next";

import {
  MoonpaySignUrlError,
  parseMoonpaySignRequestBody,
  signMoonpayUrl,
} from "~/server/integrations/moonpay/sign-moonpay-url";
import { InvalidOsmosisWalletAddressError } from "~/server/integrations/validate-osmosis-wallet-address";

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

  const privateKey = process.env.MOONPAY_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_MOONPAY_PUBLIC_KEY;

  if (!privateKey) {
    return res.status(500).send({ error: "Moonpay private key not set" });
  }

  if (!publicKey) {
    return res.status(500).send({ error: "Moonpay public key not set" });
  }

  try {
    const params = parseMoonpaySignRequestBody(await req.body);
    const signature = signMoonpayUrl(params, { privateKey, publicKey });

    return res.status(200).send({ signature });
  } catch (error) {
    if (
      error instanceof MoonpaySignUrlError ||
      error instanceof InvalidOsmosisWalletAddressError
    ) {
      const statusCode =
        error instanceof MoonpaySignUrlError ? error.statusCode : 400;
      return res.status(statusCode).send({ error: error.message });
    }

    return res
      .status(500)
      .send({ error: "An unexpected error occurred. Please try again." });
  }
}
