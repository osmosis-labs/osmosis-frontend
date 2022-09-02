import { hexToNumberString, isAddress } from "web3-utils";
import { Int } from "@keplr-wallet/unit";
import { SendFn } from "../types";
import { Erc20Abi } from "./types";

export function queryErc20Balance(
  queryFn: SendFn,
  erc20Address: string,
  accountAddress: string
): Promise<Int> {
  return new Promise(async (resolve, reject) => {
    if (isAddress(accountAddress)) {
      const res = (await queryFn({
        method: "eth_call",
        params: [
          {
            to: erc20Address,
            data: Erc20Abi.encodeFunctionData("balanceOf", [accountAddress]),
          },
          "latest",
        ],
      })) as string;
      resolve(new Int(hexToNumberString(res)));
    } else {
      reject(new Error(`Invalid address ${accountAddress}`));
    }
  });
}
