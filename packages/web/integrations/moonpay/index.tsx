import { WalletStatus } from "@cosmos-kit/core";
import { apiClient } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import { FunctionComponent, useCallback } from "react";
import { useMedia } from "react-use";

import { MoonpaySignUrlResponse } from "~/integrations/moonpay/types";
import { ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

const MoonPayBuyWidget = dynamic(
  () => import("@moonpay/moonpay-react").then((mod) => mod.MoonPayBuyWidget),
  { ssr: false }
);

export const Moonpay: FunctionComponent<
  { assetKey: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = observer(({ assetKey, isOpen }) => {
  const { chainStore, accountStore } = useStore();

  const prefersDark = useMedia("(prefers-color-scheme: dark)");

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const walletAddress = account?.address;

  const generateMoonpayUrlSignature = useCallback(
    async (url: string): Promise<string> => {
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch (error) {
        console.error("Failed to parse MoonPay widget URL", { url, error });
        throw new Error("Invalid MoonPay widget URL");
      }

      const urlWalletAddress = parsed.searchParams.get("walletAddress");
      if (urlWalletAddress && urlWalletAddress !== walletAddress) {
        throw new Error(
          "Connected wallet address does not match MoonPay widget URL"
        );
      }

      const addressToSign = urlWalletAddress ?? walletAddress;
      if (!addressToSign) {
        throw new Error("No wallet address available for MoonPay signing");
      }

      try {
        return (
          await apiClient<MoonpaySignUrlResponse>(
            "/api/integrations/moonpay/sign-url",
            {
              method: "POST",
              data: {
                walletAddress: addressToSign,
                currencyCode:
                  parsed.searchParams.get("currencyCode") ?? undefined,
                defaultCurrencyCode:
                  parsed.searchParams.get("defaultCurrencyCode") ?? undefined,
                baseCurrencyCode:
                  parsed.searchParams.get("baseCurrencyCode") ?? undefined,
                baseCurrencyAmount:
                  parsed.searchParams.get("baseCurrencyAmount") ?? undefined,
              },
            }
          )
        ).signature;
      } catch (error) {
        console.error("Failed to sign MoonPay URL", {
          walletAddress: addressToSign,
          url,
          error,
        });
        throw new Error("Failed to sign MoonPay URL");
      }
    },
    [walletAddress]
  );

  if (!(account?.walletStatus === WalletStatus.Connected) || !walletAddress) {
    return null;
  }

  return (
    <MoonPayBuyWidget
      className="!m-0 !border-[0px]"
      variant="embedded"
      baseCurrencyCode={assetKey}
      defaultCurrencyCode="OSMO"
      visible={isOpen}
      walletAddress={walletAddress}
      onUrlSignatureRequested={generateMoonpayUrlSignature}
      theme={prefersDark ? "dark" : "light"}
    />
  );
});
