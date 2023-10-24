import { Int } from "@keplr-wallet/unit";
import { hexToNumberString, hexToString, isAddress } from "web3-utils";

import { SendFn } from "~/integrations/ethereum//types";
import { Erc20Abi } from "~/integrations/ethereum/queries/types";

export function queryErc20Balance(
  queryFn: SendFn,
  erc20Address: string,
  accountAddress: string
): Promise<{ amount: Int; symbol: string; decimals: number }> {
  return new Promise(async (resolve, reject) => {
    if (isAddress(accountAddress)) {
      try {
        const amountPromise = queryFn({
          method: "eth_call",
          params: [
            {
              to: erc20Address,
              data: Erc20Abi.encodeFunctionData("balanceOf", [accountAddress]),
            },
            "latest",
          ],
        }) as Promise<string>;
        const symbolPromise = queryFn({
          method: "eth_call",
          params: [
            {
              to: erc20Address,
              data: Erc20Abi.encodeFunctionData("symbol", []),
            },
            "latest",
          ],
        }) as Promise<string>;
        const decimalsPromise = queryFn({
          method: "eth_call",
          params: [
            {
              to: erc20Address,
              data: Erc20Abi.encodeFunctionData("decimals", []),
            },
            "latest",
          ],
        }) as Promise<string>;
        const [amount, symbol, decimals] = await Promise.all([
          amountPromise,
          symbolPromise,
          decimalsPromise,
        ]);

        resolve({
          amount: new Int(hexToNumberString(amount)),
          symbol: hexToString(symbol)
            .trim()
            .replace(/\0/g, "")
            .replace("\x04", ""),
          decimals: Number(hexToNumberString(decimals)),
        });
      } catch (e) {
        reject(`queryErc20Balance: query failed: ${e}`);
      }
    } else {
      reject(`queryErc20Balance: invalid address ${accountAddress}`);
    }
  });
}
