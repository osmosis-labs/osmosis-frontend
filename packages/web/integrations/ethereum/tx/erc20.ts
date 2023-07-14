import { isAddress, toHex } from "web3-utils";

import { SendFn } from "~/integrations/ethereum//types";
import { Erc20Abi } from "~/integrations/ethereum/queries";

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
  const params = erc20TransferParams(
    fromAddress,
    toAddress,
    amount,
    erc20Address
  );

  if (params) {
    return sendFn({
      method: "eth_sendTransaction",
      params,
    });
  }

  throw new Error("Invalid params");
}

export function erc20TransferParams(
  fromAddress: string,
  toAddress: string,
  amount: string,
  erc20Address: string
): unknown[] | undefined {
  if (
    isAddress(fromAddress) &&
    isAddress(toAddress) &&
    isAddress(erc20Address)
  ) {
    return [
      {
        from: fromAddress,
        to: erc20Address,
        data: Erc20Abi.encodeFunctionData("transfer", [
          toAddress,
          toHex(amount),
        ]),
      },
      "latest",
    ];
  }
}
