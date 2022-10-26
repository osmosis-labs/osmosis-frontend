import { useState, useEffect } from "react";
import { AccountSetBase } from "@keplr-wallet/stores";
import {
  ObservableAssets,
  ObservableTransferUIConfig,
} from "../../stores/assets";
import { makeLocalStorageKVStore } from "../../stores/kv-store";
import { useWindowSize } from "../window";

export function useTransferConfig(
  assetsStore: ObservableAssets,
  account: AccountSetBase
) {
  const { isMobile } = useWindowSize();

  const [transferConfig, setTransferConfig] =
    useState<ObservableTransferUIConfig | null>(null);
  const [transferKvStore] = useState(() =>
    makeLocalStorageKVStore("transfer-ui-config")
  );
  useEffect(
    () =>
      setTransferConfig(
        new ObservableTransferUIConfig(
          assetsStore,
          account,
          transferKvStore,
          isMobile
        )
      ),
    [assetsStore, account, isMobile]
  );

  return transferConfig;
}
