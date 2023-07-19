import { Int } from "@keplr-wallet/unit";
import { hexToNumberString, isAddress } from "web3-utils";

import { SendFn } from "~/integrations/ethereum/types";

export function queryAccountBalance(
  queryFn: SendFn,
  accountAddress: string
): Promise<Int> {
  return new Promise(async (resolve, reject) => {
    if (isAddress(accountAddress)) {
      try {
        const res = (await queryFn({
          method: "eth_getBalance",
          params: [accountAddress, "latest"],
        })) as string;
        resolve(new Int(hexToNumberString(res)));
      } catch (e) {
        reject(`queryAccountBalance: query failed: ${e}`);
      }
    } else {
      reject(`queryAccountBalance: invalid address ${accountAddress}`);
    }
  });
}
