import { Dec, Int } from "@keplr-wallet/unit";
import { hexToNumberString } from "web3-utils";

import { SendFn } from "~/integrations/ethereum/types";

/**
 * Estimate an EVM tx gas cost in wei.
 * @param sendFn Function to carry out EVM RPC call.
 * @param params Tx params to estimate.
 * @returns Promise of estimation as whole int.
 */
export async function estimateTxGas(
  sendFn: SendFn,
  params: unknown[]
): Promise<Int> {
  const gasAmountRaw = await sendFn({
    method: "eth_estimateGas",
    params,
  });
  const gasAmount = hexToNumberString(gasAmountRaw as string);
  const gasPriceHex = await sendFn({
    method: "eth_gasPrice",
    params: [],
  });
  const gasPrice = hexToNumberString(gasPriceHex as string);
  const gasCost = new Dec(gasAmount).mul(new Dec(gasPrice));

  return gasCost.truncate();
}
