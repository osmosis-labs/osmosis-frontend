import { useState } from "react";
import { ObservableTransferUIConfig } from "../../stores/assets";
import { makeLocalStorageKVStore } from "../../stores/kv-store";
import { useStore } from "../../stores";
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
