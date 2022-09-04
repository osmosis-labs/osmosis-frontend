import { numberToHex } from "web3-utils";
import type { EthereumProvider } from "../../window";
import { getKeyByValue } from "../../components/utils";
import { SendFn, ChainNames } from "./types";

export function switchToChain(
  request: SendFn,
  chainName: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const hexChainId = getKeyByValue(ChainNames, chainName);
    try {
      await request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (e: any) {
      // 4902: chain not in metamask
      if (e.code === 4902) {
        const ethChains: any[] = await (
          await fetch("https://chainid.network/chains.json")
        ).json();

        console.log(ethChains);

        const chainConfig = ethChains.find(
          (chain) => numberToHex(chain.chainId) === hexChainId
        );

        await request({
          method: "wallet_addEthereumChain",
          params: [{ chainId: hexChainId, ...chainConfig }],
        });
        await switchToChain(request, chainName);
      }
      resolve();
    }

    reject("MetaMask not installed");
  });
}

export function withEthInWindow<T>(
  doTask: (eth: EthereumProvider) => T | undefined,
  defaultRet?: T
) {
  if (
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    window.ethereum.isMetaMask
  ) {
    return doTask(window.ethereum);
  }
  if (typeof window !== "undefined") {
    console.warn("MetaMask: no window.ethereum found");
  }
  return defaultRet;
}
