import { useState } from "react";

import { useStore } from "~/stores";
import { makeLocalStorageKVStore } from "~/stores/kv-store";
import { ObservableTransferUIConfig } from "~/stores/transfer-ui-config";

import { useWindowSize } from "../window";

export function useTransferConfig() {
  const { isMobile } = useWindowSize();
  const { assetsStore } = useStore();

  const [transferConfig] = useState<ObservableTransferUIConfig>(
    () =>
      new ObservableTransferUIConfig(
        assetsStore,
        makeLocalStorageKVStore("transfer-ui-config")
      )
  );
  transferConfig.setIsMobile(isMobile);

  return transferConfig;
}
