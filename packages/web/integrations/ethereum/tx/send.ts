import { Dec } from "@keplr-wallet/unit";
import { hexToNumberString, isAddress, toHex } from "web3-utils";

import { SendFn } from "../types";

/**
 * EVM Send
 * @param sendFn Function to carry out RPC call.
 * @param amount Bignumber amount. Will be converted to hex.
 * @param fromAddress User source address.
 * @param toAddress User destination address.
 * @returns Result of send function.
 */
export async function send(
  sendFn: SendFn,
  amount: string,
  fromAddress: string,
  toAddress: string
): Promise<unknown> {
  if (isAddress(fromAddress) && isAddress(toAddress)) {
    return sendFn({
      method: "eth_sendTransaction",
      params: [
        {
          from: fromAddress,
          to: toAddress,
          value: toHex(amount),
        },
        "latest",
      ],
    });
  }

  return Promise.reject("Invalid address");
}

/**
 * Estimate an EVM Send in string wei, since sends should be less market gas to succeed.
 * @param sendFn Function to carry out RPC call.
 * @param amount Bignumber amount. Will be converted to hex.
 * @param fromAddress User source address.
 * @param toAddress User destination address.
 * @returns Result of send function.
 */
export function estimateSendGas(
  sendFn: SendFn,
  amount: string,
  fromAddress: string,
  toAddress: string
): Promise<string> {
  if (isAddress(fromAddress) && isAddress(toAddress)) {
    return new Promise(async (resolve, reject) => {
      try {
        const gasAmountRaw = await sendFn({
          method: "eth_estimateGas",
          params: [
            {
              from: fromAddress,
              to: toAddress,
              value: toHex(amount),
            },
            "latest",
          ],
        });
        const gasAmount = hexToNumberString(gasAmountRaw as string);
        const gasPriceHex = await sendFn({
          method: "eth_gasPrice",
          params: [],
        });
        const gasPrice = hexToNumberString(gasPriceHex as string);
        const gasCost = new Dec(gasAmount).mul(new Dec(gasPrice));

        resolve(gasCost.truncate().toString());
      } catch (e) {
        reject(e);
      }
    });
  }

  return Promise.reject("Invalid address");
}
