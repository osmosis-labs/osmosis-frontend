import { apiClient } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import { FunctionComponent } from "react";

import { MoonpaySignUrlResponse } from "~/integrations/moonpay/types";
import { ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

const MoonPayBuyWidget = dynamic(
  () => import("@moonpay/moonpay-react").then((mod) => mod.MoonPayBuyWidget),
  { ssr: false }
);

async function generateMoonpayUrlSignature(url: string): Promise<string> {
  return (
    await apiClient<MoonpaySignUrlResponse>(
      "/api/integrations/moonpay/sign-url",
      {
        method: "POST",
        data: {
          url,
        },
      }
    )
  ).signature;
}

export const Moonpay: FunctionComponent<
  { assetKey: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = observer(({ assetKey, isOpen }) => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  let walletAddress = account?.address;

  return (
    <MoonPayBuyWidget
      className="!m-0"
      variant="embedded"
      baseCurrencyCode={assetKey}
      defaultCurrencyCode="OSMO"
      visible={isOpen}
      walletAddress={walletAddress}
      onUrlSignatureRequested={generateMoonpayUrlSignature}
    />
  );
});
