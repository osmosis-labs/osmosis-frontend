import { useEffect, useRef, useState } from "react";

import { AvailableBridges } from "~/integrations/bridges/bridge-manager";
import type {
  BridgeProvider,
  GetDepositAddressParams,
} from "~/integrations/bridges/types";
import { useBridgeManager } from "~/integrations/bridges/use-bridge-manager";

function getCacheKey(params: GetDepositAddressParams) {
  return `${params.fromChain.chainId}/${params.toChain.chainId}/${
    params.toAddress
  }/${params.fromAsset.minimalDenom}/${Boolean(params.autoUnwrapIntoNative)}`;
}

export const useBridgeDepositAddress = ({
  providerId,
  isEnabled,
  ...getDepositAddressParams
}: GetDepositAddressParams & {
  providerId?: AvailableBridges;
  isEnabled?: boolean;
}) => {
  const [depositAddress, setDepositAddress] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const { bridgeManager } = useBridgeManager();

  const depositAddressCache = useRef(new Map<string, string>());

  useEffect(() => {
    if (!isEnabled || !providerId) return;

    const cacheKey = getCacheKey(getDepositAddressParams);
    const cacheHit = depositAddressCache.current.get(cacheKey);
    if (cacheHit) {
      setDepositAddress(cacheHit);
      return;
    }

    const currentBridge: BridgeProvider | undefined =
      bridgeManager.bridges[providerId];

    if (!currentBridge || !currentBridge.getDepositAddress) return;

    setIsLoading(true);
    currentBridge
      .getDepositAddress(getDepositAddressParams)
      .then(({ depositAddress }) => {
        setDepositAddress(depositAddress);
        depositAddressCache.current.set(cacheKey, depositAddress);
      })
      .catch((e) => {
        setError(
          new Error(
            `Failed to get deposit address for ${providerId}. Details: ${e}`
          )
        );
      })
      .finally(() => setIsLoading(false));
  }, [bridgeManager.bridges, getDepositAddressParams, isEnabled, providerId]);

  return { depositAddress, isLoading, error };
};
