import { HTTPMethod } from "@osmosis-labs/utils";

import { BLOCKAID_BASE_URL } from "../../env";
import { blockaidAuthHeaders } from ".";

export interface TransactionScanRequest {
  chain?: string;
  /**
   * Example: ['simulation']
   */
  options: string[];
  /**
   * Tx hex bytes
   */
  transaction: string;
  metadata: { [key: string]: string };
}

export interface TransactionScanResponse {
  simulation: Simulation;
}

export interface Simulation {
  status: string;
  error: string;
  events: any[];
  gas_info: GasInfo;
  msg_responses: any[];
  asset_diff: AssetDiff;
  params: Params;
}

export interface GasInfo {
  gas_wanted: string;
  gas_used: string;
}

export interface AssetDiff {
  bank_tokens: BankTokens;
  usd_diff: UsdDiff;
  missing_prices: boolean;
}

export interface BankTokens {
  diff: Diff;
}

export interface Diff {}

export interface UsdDiff {
  diff: Diff2;
}

export interface Diff2 {}

export interface Params {
  signer: string;
  messages: any[];
  memo: string;
  sequence: string;
}

export async function transactionScan(payload: TransactionScanRequest) {
  if (!BLOCKAID_BASE_URL) throw new Error("BLOCKAID_BASE_URL not set");

  const url = new URL("/v0/cosmos/transaction/scan/", BLOCKAID_BASE_URL);

  return fetch(url.toString(), {
    headers: {
      ...blockaidAuthHeaders,
      "Content-Type": "application/json",
    },
    method: HTTPMethod.POST,
    body: JSON.stringify(payload),
  });
}
