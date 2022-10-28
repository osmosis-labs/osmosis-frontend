import { useEffect, useState } from "react";
import { WalletStatus } from "@keplr-wallet/stores";
import { useStore } from "../../stores";

const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

/** Use transak-sdk to open their modal in our window. Bypasses our `react-modal` setup. */
export function useTransakModal(
  {
    onRequestClose,
    showOnMount,
  }: {
    onRequestClose?: () => void;
    showOnMount?: boolean;
  } = { showOnMount: false }
): {
  setModal: (show: boolean) => void;
} {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.osmosis.chainId);

  const [transak, setTransak] = useState<any | null>(null);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (account.walletStatus === WalletStatus.Loaded) {
      import("@transak/transak-sdk" as any).then(({ default: transakSdk }) => {
        const transak = new transakSdk({
          apiKey: IS_TESTNET
            ? "1cb6bc52-acd6-4633-ba31-195843d0c69f" // STAGING API Key
            : "e844549d-f35c-4b3c-9269-48841ad8a561", // PROD API Key
          environment: IS_TESTNET ? "STAGING" : "PRODUCTION", // STAGING/PRODUCTION
          widgetHeight: "625px",
          widgetWidth: "500px",
          // Examples of some of the customization parameters you can pass
          defaultCryptoCurrency: "OSMO", // Example 'ETH'
          walletAddress: account.bech32Address, // Your customer's wallet address
          themeColor: "#462ADF", // App theme color // wosmongton-700
          fiatCurrency: "USD", // If you want to limit fiat selectison eg 'USD'
          email: "", // Your customer's email address
          redirectURL: "",
        });

        setTransak(transak);

        // This will trigger when the user closed the widget
        transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
          transak.close();
          setShouldShow(false);
          onRequestClose?.();
        });

        // This will trigger when the user marks payment is made.
        transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, () => {
          transak.close();
          setShouldShow(false);
          onRequestClose?.();
        });
      });
    } else {
      setTransak(null);
    }
  }, [account.walletStatus]);

  useEffect(() => {
    if ((showOnMount || shouldShow) && transak) {
      transak.init();
      setShouldShow(false);
    }
  }, [shouldShow, transak]);

  return { setModal: setShouldShow };
}
