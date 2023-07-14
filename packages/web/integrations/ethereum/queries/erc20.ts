import { Int } from "@keplr-wallet/unit";
import { hexToNumberString, isAddress } from "web3-utils";

import { SendFn } from "~/integrations/ethereum//types";
import { Erc20Abi } from "~/integrations/ethereum/queries/types";

export function queryErc20Balance(
  queryFn: SendFn,
  erc20Address: string,
  accountAddress: string
): Promise<Int> {
  return new Promise(async (resolve, reject) => {
    if (isAddress(accountAddress)) {
      try {
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
      } catch (e) {
        reject(`queryErc20Balance: query failed: ${e}`);
      }
    } else {
      reject(`queryErc20Balance: invalid address ${accountAddress}`);
    }
  });
}
