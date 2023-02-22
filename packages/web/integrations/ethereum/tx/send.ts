import { isAddress, toHex } from "web3-utils";

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
      params: sendParams(fromAddress, toAddress, amount),
    });
  }

  return Promise.reject("Invalid address");
}

export function sendParams(
  fromAddress: string,
  toAddress: string,
  amount: string
): unknown[] {
  return [
    {
      from: fromAddress,
      to: toAddress,
      value: toHex(amount),
    },
    "latest",
  ];
}
