import { useState, useEffect } from "react";
import WalletConnect from "@walletconnect/client";
import { useLocalStorageState } from "../../hooks";
import { Client, ChainNames } from "./types";

export function useWalletConnect(
  setQrCodeModalUri: (uri?: string) => void
): Client {
  const [connector] = useState(
    () =>
      new WalletConnect({
        bridge: "https://bridge.walletconnect.org",
        qrcodeModal: {
          open: (uri) => setQrCodeModalUri(uri),
          close: () => setQrCodeModalUri(undefined),
        },
      })
  );
  const [address, setAddress] = useLocalStorageState<string | null>(
    "walletconnect_connected_ethereum_address",
    null
  );
  const [chainId, setChainId] = useLocalStorageState<string | null>(
    "walletconnect_connected_ethereum_chainId",
    null
  );

  useEffect(() => {
    const setAccounts = (error: any, payload: any) => {
      if (error) {
        return; // TODO: handle errors
      }

      console.log("payload", payload, { error });
      const { accounts, chainId } = payload.params[0];
      setAddress(accounts[0]);
      setChainId(chainId);
    };

    connector.on("connect", setAccounts);
    connector.on("session_update", setAccounts);
    connector.on("disconnect", () => setAddress(null));
  }, [connector, setAddress, setChainId]);

  return {
    accountAddress: address ?? undefined,
    chain: chainId ? ChainNames[chainId] : undefined,
    enable: () => {
      connector.createSession().then(() => connector.connect());
    },
    disable: () => {
      withConnectedClient(connector, address, async (conn) => {
        conn.killSession().then(() => setAddress(null));
      });
    },
    sendTx: (_methods, ethTx) => {
      return withConnectedClient(connector, address, (conn, addr) => {
        return conn.sendTransaction({ ...ethTx, from: addr });
      });
    },
  };
}

function withConnectedClient(
  connector: WalletConnect,
  address: string | null,
  doTask: (connector: WalletConnect, address: string) => Promise<unknown>
): Promise<unknown> {
  if (!connector.connected) {
    return Promise.reject("WalletConnect client is not connected");
  }
  if (address === null) {
    return Promise.reject("Account not connected");
  }

  return doTask(connector, address);
}
