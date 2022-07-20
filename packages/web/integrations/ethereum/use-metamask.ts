import { useEffect } from "react";
import { toHex, isAddress } from "web3-utils";
import { useLocalStorageState } from "../../hooks";
import type { EthereumProvider } from "../../window";
import { ChainNames, EthClient } from "./types";

/** Hook intended for simple interactions with Ethereum via MetaMask browser extension. */
export function useMetaMask(): EthClient {
  const [address, setAddress] = useLocalStorageState<string | null>(
    "metamask_connected_ethereum_address",
    null
  );
  const [chainId, setChainId] = useLocalStorageState<string | null>(
    "metamask_connected_ethereum_chainId",
    null
  );

  // sync current metamask state
  useEffect(() => {
    withEthInWindow((eth) => {
      const handleAccountChanged = ([account]: string[]) => {
        setAddress(account);
      };

      eth.on("accountsChanged", handleAccountChanged);
      eth.on("chainChanged", (chainId) => setChainId(chainId));
      eth.on("disconnect", () => {
        setAddress(null);
      });
    });

    return () => {
      withEthInWindow((eth) => eth.removeAllListeners());
    };
  }, [setAddress, setChainId]);

  return {
    key: "metamask",
    accountAddress: address ?? undefined,
    chain: chainId ? ChainNames[chainId] : undefined,
    isConnected: !!address,
    displayInfo: {
      iconUrl: "/icons/metamask-fox.svg",
      displayName: "Metamask",
      caption: "Metamask browser extension",
    },
    enable: () => {
      return new Promise<void>((resolve, reject) => {
        if (
          typeof window === "undefined" ||
          typeof window.ethereum === "undefined" ||
          !window.ethereum.isMetaMask
        ) {
          reject("MetaMask: not installed");
        }

        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((accounts) => {
            setAddress((accounts as string[])[0]);

            window.ethereum
              .request({ method: "eth_chainId" })
              .then((chainId) => setChainId(chainId as string));

            resolve();
          })
          .catch(reject);
      });
    },
    disable: () => {
      setAddress(null);
      setChainId(null);
    },
    send: ({ method, params: ethTx }) => {
      if (!address || !isAddress(address)) {
        return Promise.reject(
          "Metamask: can't send request, account not connected"
        );
      }

      return (
        withEthInWindow((ethereum) => {
          return ethereum.request({
            method,
            params: Array.isArray(ethTx)
              ? ethTx
              : [
                  {
                    from: address,
                    ...ethTx,
                    value: ethTx.value ? toHex(ethTx.value) : undefined,
                  },
                ],
          });
        }) ||
        Promise.reject(
          "Metamask: failed to send message: ethereum not in window"
        )
      );
    },
  };
}

function withEthInWindow<T>(
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
  return defaultRet;
}
