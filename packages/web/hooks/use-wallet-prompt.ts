import { useEffect } from "react";

import { useTranslation } from "~/hooks/language";
import { useWallet } from "~/hooks/use-wallet";
import {
  cancelWalletRequests,
  resetWalletRequestCancel,
} from "~/integrations/core-walletconnect/pending-request";

/**
 * Loading label, and a cancel for mobile wallets, for a button whose action
 * waits on a wallet signature. The label follows the wallet type rather than
 * the open request, since one signature can be several requests with gaps.
 *
 * `signsLocally` (an active 1CT session) drops the label and the cancel, since
 * no wallet is involved.
 */
export function useWalletPrompt({
  isLoading,
  signsLocally = false,
}: {
  isLoading: boolean;
  signsLocally?: boolean;
}) {
  const { t } = useTranslation();
  const { wallet } = useWallet();

  // A cancel holds until the attempt it cancelled has ended.
  useEffect(() => {
    if (!isLoading) resetWalletRequestCancel();
    return resetWalletRequestCancel;
  }, [isLoading]);

  const isOnPhone =
    !signsLocally && wallet?.walletInfo.mode === "wallet-connect";

  return {
    isOnPhone,
    label: isOnPhone
      ? t("signInMobileWallet")
      : signsLocally
        ? undefined
        : t("waitingForWallet"),
    onCancel: isLoading && isOnPhone ? cancelWalletRequests : undefined,
  };
}
