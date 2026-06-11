import { MoonPay } from "@moonpay/moonpay-node";

import { validateOsmosisWalletAddress } from "../validate-osmosis-wallet-address";

export class MoonpaySignUrlError extends Error {
  constructor(message: string, readonly statusCode: number = 400) {
    super(message);
    this.name = "MoonpaySignUrlError";
  }
}

export interface MoonpaySignUrlParams {
  walletAddress: string;
  currencyCode?: string;
  defaultCurrencyCode?: string;
  baseCurrencyCode?: string;
  baseCurrencyAmount?: string;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function parseMoonpaySignRequestBody(
  body: unknown
): MoonpaySignUrlParams {
  if (body == null || typeof body !== "object") {
    throw new MoonpaySignUrlError("Invalid request body");
  }

  const record = body as Record<string, unknown>;

  if ("url" in record) {
    throw new MoonpaySignUrlError(
      "Raw MoonPay URLs are not accepted; send walletAddress and currency parameters instead"
    );
  }

  const walletAddress = record.walletAddress;
  if (typeof walletAddress !== "string" || !walletAddress) {
    throw new MoonpaySignUrlError("walletAddress is required");
  }

  return {
    walletAddress,
    currencyCode: optionalString(record.currencyCode),
    defaultCurrencyCode: optionalString(record.defaultCurrencyCode),
    baseCurrencyCode: optionalString(record.baseCurrencyCode),
    baseCurrencyAmount: optionalString(record.baseCurrencyAmount),
  };
}

export function buildMoonpayUrl(
  params: MoonpaySignUrlParams,
  publicKey: string
): string {
  validateOsmosisWalletAddress(params.walletAddress);

  const currencyCode =
    params.currencyCode ?? params.defaultCurrencyCode ?? "OSMO";

  const searchParams = new URLSearchParams({
    apiKey: publicKey,
    walletAddress: params.walletAddress,
    currencyCode,
  });

  if (params.baseCurrencyCode) {
    searchParams.set("baseCurrencyCode", params.baseCurrencyCode);
  }

  if (params.baseCurrencyAmount) {
    searchParams.set("baseCurrencyAmount", params.baseCurrencyAmount);
  }

  const host = publicKey.startsWith("pk_live")
    ? "https://buy.moonpay.com"
    : "https://buy-sandbox.moonpay.com";

  return `${host}?${searchParams.toString()}`;
}

export function signMoonpayUrl(
  params: MoonpaySignUrlParams,
  options: { privateKey: string; publicKey: string }
): string {
  const moonPayUrl = buildMoonpayUrl(params, options.publicKey);
  const moonPay = new MoonPay(options.privateKey);
  const signature = moonPay.url.generateSignature(moonPayUrl);

  if (!signature) {
    throw new MoonpaySignUrlError("Failed to generate signature", 500);
  }

  return signature;
}
