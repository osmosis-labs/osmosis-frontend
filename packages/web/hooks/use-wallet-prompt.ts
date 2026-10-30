import { useEffect, useSyncExternalStore } from "react";

import { useTranslation } from "~/hooks/language";
import { useWallet } from "~/hooks/use-wallet";
import {
  cancelWalletRequests,
  isWalletSigned,
  resetWalletRequestCancel,
  resetWalletSigned,
  subscribeWalletSigned,
} from "~/integrations/core-walletconnect/pending-request";

/**
 * Loading label, and a cancel for mobile wallets, for a button whose action
 * waits on a wallet signature. The label follows the wallet type rather than
 * the open request, since one signature can be several requests with gaps.
 *
 * `signsLocally` (an active 1CT session) drops the label and the cancel, since
 * no wallet is involved. Both also drop once the wallet has signed, leaving a
 * plain spinner while the tx broadcasts.
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
  const hasSigned = useSyncExternalStore(
    subscribeWalletSigned,
    isWalletSigned,
    () => false
  );

  // A cancel, and the signed state, hold until the attempt has ended.
  useEffect(() => {
    const reset = () => {
      resetWalletRequestCancel();
      resetWalletSigned();
    };
    if (!isLoading) reset();
    return reset;
  }, [isLoading]);

  const isOnPhone =
    !signsLocally && wallet?.walletInfo.mode === "wallet-connect";
  const isWaiting = !signsLocally && !hasSigned;

  return {
    /** The wallet prompt is on the phone and not yet answered. */
    isOnPhone: isOnPhone && isWaiting,
    label: !isWaiting
      ? undefined
      : isOnPhone
        ? t("signInMobileWallet")
        : t("waitingForWallet"),
    onCancel:
      isLoading && isOnPhone && isWaiting ? cancelWalletRequests : undefined,
  };
}
