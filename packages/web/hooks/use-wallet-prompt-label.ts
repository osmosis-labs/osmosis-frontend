import { useSyncExternalStore } from "react";

import { useTranslation } from "~/hooks/language";
import {
  hasPendingWalletRequest,
  subscribePendingWalletRequest,
} from "~/integrations/core-walletconnect/pending-request";

/**
 * Loading label for a button whose action waits on a wallet signature. Points
 * at the phone while a WalletConnect request is open, since the prompt is not
 * on this screen.
 *
 * `signsLocally` (an active 1CT session) drops the label, since no wallet is
 * involved, unless signing fell back to WalletConnect anyway.
 */
export function useWalletPromptLabel({
  signsLocally = false,
}: { signsLocally?: boolean } = {}) {
  const { t } = useTranslation();
  const isWaitingOnPhone = useSyncExternalStore(
    subscribePendingWalletRequest,
    hasPendingWalletRequest,
    () => false
  );
  if (isWaitingOnPhone) return t("signInMobileWallet");
  return signsLocally ? undefined : t("waitingForWallet");
}
