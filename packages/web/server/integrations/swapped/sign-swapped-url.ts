import { isCosmosAddressValid } from "@osmosis-labs/utils";
import crypto from "crypto";

export const SWAPPED_WIDGET_PUBLIC_KEY =
  "pk_live_bf928a1d16cbf9f4e4b1280d87c30dc5";

const CURRENCY_CODE = "OSMO";
const BASE_CURRENCY_CODE = "USD";
const BASE_CURRENCY_AMOUNT = 200;
const STYLE = "9a4e4a18a5725bf1c9237c1297549aa0";

export class SwappedSignUrlError extends Error {
  constructor(message: string, readonly statusCode: number = 400) {
    super(message);
    this.name = "SwappedSignUrlError";
  }
}

export function parseSwappedSignRequestBody(body: unknown): {
  walletAddress: string;
} {
  const parsed =
    typeof body === "string"
      ? (JSON.parse(body) as Record<string, unknown>)
      : (body as Record<string, unknown>);

  if (parsed == null || typeof parsed !== "object") {
    throw new SwappedSignUrlError("Invalid request body");
  }

  const walletAddress = parsed.walletAddress;
  if (typeof walletAddress !== "string" || !walletAddress) {
    throw new SwappedSignUrlError("walletAddress is required");
  }

  return { walletAddress };
}

export function signSwappedUrl(
  walletAddress: string,
  secretKey: string
): { url: string } {
  if (!isCosmosAddressValid({ address: walletAddress, bech32Prefix: "osmo" })) {
    throw new SwappedSignUrlError(
      "walletAddress must be a valid Osmosis address"
    );
  }

  const originalUrl = `https://widget.swapped.com?apiKey=${SWAPPED_WIDGET_PUBLIC_KEY}&currencyCode=${CURRENCY_CODE}&walletAddress=${walletAddress}&baseCurrencyCode=${BASE_CURRENCY_CODE}&baseCurrencyAmount=${BASE_CURRENCY_AMOUNT}&style=${STYLE}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(new URL(originalUrl).search)
    .digest("base64");

  const urlWithSignature = `${originalUrl}&signature=${encodeURIComponent(
    signature
  )}`;

  return { url: urlWithSignature };
}
