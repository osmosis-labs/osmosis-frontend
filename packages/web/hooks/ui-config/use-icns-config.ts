import { useState } from "react";
import { makeLocalStorageKVStore } from "../../stores/kv-store";
import { ICNSConfig } from "@osmosis-labs/stores";

export function useICNSConfig() {
  const [icnsConfig] = useState<ICNSConfig>(
    () => new ICNSConfig(makeLocalStorageKVStore("icns-config"))
  );

  return icnsConfig;
}
