import {
  ResourceUnavailableRpcError,
  UnauthorizedProviderError,
  UserRejectedRequestError,
} from "viem";
import { BaseError } from "wagmi";

import { MultiLanguageT } from "~/hooks";

export function getWagmiToastErrorMessage({
  error,
  t,
  walletName,
}: {
  error: BaseError;
  t: MultiLanguageT;
  walletName: string;
}) {
  if (error.name === UserRejectedRequestError.name) {
    return {
      titleTranslationKey: "transactionFailed",
      captionTranslationKey: "requestRejected",
    };
  } else if (error.name === UnauthorizedProviderError.name) {
    return {
      titleTranslationKey: "Action Unavailable",
      captionTranslationKey: "Please log into MetaMask",
    };
  } else if (error.name === ResourceUnavailableRpcError.name) {
    return {
      titleTranslationKey: t("assets.transfer.errors.seeRequest", {
        walletName,
      }),
    };
  } else {
    return {
      titleTranslationKey: "transactionFailed",
    };
  }
}
