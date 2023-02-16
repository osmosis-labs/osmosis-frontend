import { isAddress, toHex } from "web3-utils";

import { Erc20Abi } from "../queries";
import { SendFn } from "../types";

/**
 * ERC20 Transfer
 * @param sendFn Function to carry out RPC call.
 * @param amount Bignumber amount. Will be converted to hex.
 * @param erc20Address Hex contract address.
 * @param toAddress User destination address.
 * @returns Result of send function.
 */
export async function transfer(
  sendFn: SendFn,
  amount: string,
  erc20Address: string,
  fromAddress: string,
  toAddress: string
): Promise<unknown> {
  if (
    isAddress(fromAddress) &&
    isAddress(erc20Address) &&
    isAddress(toAddress)
  ) {
    return sendFn({
      method: "eth_sendTransaction",
      params: [
        {
          from: fromAddress,
          to: erc20Address,
          data: Erc20Abi.encodeFunctionData("transfer", [
            toAddress,
            toHex(amount),
          ]),
        },
        "latest",
      ],
    });
  }

  return Promise.reject("Invalid address");
}
