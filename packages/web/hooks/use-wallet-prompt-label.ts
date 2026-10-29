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
 */
export function useWalletPromptLabel() {
  const { t } = useTranslation();
  const isWaitingOnPhone = useSyncExternalStore(
    subscribePendingWalletRequest,
    hasPendingWalletRequest,
    () => false
  );
  return isWaitingOnPhone ? t("signInMobileWallet") : t("waitingForWallet");
}
