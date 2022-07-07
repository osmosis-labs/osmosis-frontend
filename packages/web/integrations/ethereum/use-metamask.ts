import { useEffect } from "react";
import { utf8ToHex } from "../../components/utils";
import { useLocalStorageState } from "../../hooks";
import type { EthereumProvider } from "../../window";
import { ChainNames, Client, Methods, Transaction } from "./types";

/** Hook intended for simple interactions with Ethereum via MetaMask browser extension. */
export function useMetaMask(): Client {
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

      const closeConnection = () => {
        setAddress(null);
      };
      eth.on("accountsChanged", handleAccountChanged);
      eth.on("chainChanged", (chainId) => setChainId(chainId));
      eth.on("close", closeConnection);
    });

    return () => {
      withEthInWindow((eth) => eth.removeAllListeners());
    };
  }, [setAddress, setChainId]);

  console.log(chainId);

  return {
    accountAddress: address ?? undefined,
    chain: chainId ? ChainNames[chainId] : undefined,
    enable: () => {
      withEthInWindow((eth) => {
        eth.request({ method: "eth_requestAccounts" }).then((accounts) => {
          setAddress((accounts as string[])[0]);
        });
        eth.request({ method: "eth_chainId" }).then((chainId) => {
          setChainId(chainId as string);
        });
      });
    },
    disable: () => {
      setAddress(null);
    },
    sendTx: (method: Methods, txParams: Transaction) => {
      if (!address) {
        return Promise.reject("Can't send request: account not connected");
      }

      withEthInWindow((ethereum) => {
        return ethereum.request({
          method,
          params: Array.isArray(txParams)
            ? txParams
            : {
                from: address,
                ...txParams,
                value: utf8ToHex(txParams.value),
              },
        });
      });

      return Promise.reject("Failed to send message: ethereum not in window");
    },
  };
}

function withEthInWindow(doTask: (eth: EthereumProvider) => void) {
  if (
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    window.ethereum.isMetaMask
  ) {
    doTask(window.ethereum);
  }
}
