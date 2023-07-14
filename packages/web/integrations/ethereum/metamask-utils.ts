import { numberToHex } from "web3-utils";

import { getKeyByValue } from "~/utils/object";
import type { EthereumProvider } from "../../window";
import { ChainNames, SendFn } from "./types";

export function switchToChain(
  request: SendFn,
  chainName: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const hexChainId = getKeyByValue(ChainNames, chainName);
    try {
      if (!hexChainId) {
        throw new Error(`${chainName} not yet added to Axelar config`);
      }

      await request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
      resolve();
    } catch (e: any) {
      if (e.code === 4902) {
        // 4902: chain not in metamask
        const ethChains: any[] = await (
          await fetch("https://chainid.network/chains.json")
        ).json();

        const chainConfig = ethChains.find(
          (chain) => numberToHex(chain.chainId) === hexChainId
        );

        if (!chainConfig) {
          throw new Error(
            `ChainList does not contain config for chain ${hexChainId}`
          );
        }

        const params = {
          chainId: numberToHex(chainConfig.chainId), // A 0x-prefixed hexadecimal string
          chainName: chainConfig.name,
          nativeCurrency: {
            name: chainConfig.nativeCurrency.name,
            symbol: chainConfig.nativeCurrency.symbol, // 2-6 characters long
            decimals: chainConfig.nativeCurrency.decimals,
          },
          rpcUrls: chainConfig.rpc,
          blockExplorerUrls: [
            chainConfig.explorers &&
            chainConfig.explorers.length > 0 &&
            chainConfig.explorers[0].url
              ? chainConfig.explorers[0].url
              : chainConfig.infoURL,
          ],
        };

        await request({
          method: "wallet_addEthereumChain",
          params: [params],
        });

        // try again
        switchToChain(request, chainName).then(resolve);
        return;
      } else if (e.code === -32002) {
        // -32002: Request of type 'wallet_switchEthereumChain' already pending
        reject("switchToChain: switch in progress");
      } else {
        reject(`switchToChain: unexpected error: ${e.message}`);
      }
    }

    reject("switchToChain: MetaMask not installed");
  });
}

export function withEthInWindow<T>(
  doTask: (eth: EthereumProvider) => T | undefined,
  defaultRet?: T
) {
  if (
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    typeof document !== "undefined" &&
    /complete|interactive|loaded/.test(document.readyState) &&
    window.ethereum.isMetaMask
  ) {
    return doTask(window.ethereum);
  }
  return defaultRet;
}

/// credit: https://github.com/gpxl-dev/truncate-eth-address/blob/main/src/index.ts
/**
 * Truncates an ethereum address to the format 0x0000…0000
 * @param address Full address to truncate
 * @returns Truncated address
 */
export function truncateEthAddress(address: string) {
  /** Captures 0x + 4 characters, then the last 4 characters. */
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
}
