import { WalletAccount } from "@cosmos-kit/core";
import { NotifiParams } from "@notifi-network/notifi-react-card";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";

import { useStore } from "../../stores";
import { NotifiConfigContext } from "./notifi-config-context";
import { NotifiModalContextProvider } from "./notifi-modal-context";

const NotifiContext = dynamic<NotifiParams>(
  () =>
    import("@notifi-network/notifi-react-card").then(
      (mod) => mod.NotifiContext
    ),
  {
    ssr: false,
  }
);

interface RequiredInfo {
  account: WalletAccount;
  chainId: string;
}

const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";
const NotifiContextProviderImpl: FunctionComponent<PropsWithChildren<{}>> =
  observer(({ children }) => {
    const {
      chainStore: {
        osmosis: { chainId },
      },
      accountStore,
    } = useStore();
    const [info, setInfo] = useState<RequiredInfo | undefined>();
    const wallet = accountStore.getWallet(chainId);
    const walletConnected = Boolean(wallet?.isWalletConnected);

    useEffect(() => {
      if (!walletConnected) {
        return;
      }
      getRequiredInfo(chainId, accountStore).then((info) => setInfo(info));
    }, [accountStore, chainId, wallet, walletConnected]);

    if (info === undefined) {
      return <>{children}</>;
    }

    return (
      <NotifiContext
        env={IS_TESTNET ? "Development" : "Production"}
        walletBlockchain="OSMOSIS"
        dappAddress="osmosis"
        accountAddress={info.account.address}
        walletPublicKey={Buffer.from(info.account.pubkey).toString("base64")}
        signMessage={async (message: Uint8Array): Promise<Uint8Array> => {
          const wallet = accountStore.getWallet(info.chainId);
          if (
            wallet === undefined ||
            wallet.client.signArbitrary === undefined
          ) {
            throw new Error("Wallet does not support signing Notifi messages");
          }
          const result = await wallet.client.signArbitrary(
            info.chainId,
            info.account.address,
            message
          );
          return Buffer.from(result.signature, "base64");
        }}
      >
        <NotifiConfigContext
          type="SUBSCRIPTION_CARD"
          id={
            IS_TESTNET
              ? "c5fb30811f5b47b79dd9a400480c2670"
              : "c5fb30811f5b47b79dd9a400480c2670"
          }
        >
          <NotifiModalContextProvider account={info.account.address}>
            {children}
          </NotifiModalContextProvider>
        </NotifiConfigContext>
      </NotifiContext>
    );
  });

const getRequiredInfo = async (
  chainId: string,
  accountStore: ReturnType<typeof useStore>["accountStore"]
): Promise<RequiredInfo | undefined> => {
  const wallet = accountStore.getWallet(chainId);
  if (wallet === undefined || wallet.client.getAccount === undefined) {
    return;
  }

  const account = await wallet.client.getAccount(chainId);

  return {
    account,
    chainId,
  };
};

export const NotifiContextProvider = NotifiContextProviderImpl;
