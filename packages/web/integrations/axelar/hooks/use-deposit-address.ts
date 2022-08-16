import { useState, useEffect, useCallback } from "react";
import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";

export function useDepositAddress(
  sourceChain: string,
  destChain: string,
  address: string | undefined,
  tokenMinDenom: string,
  generateOnMount = true,
  environment = Environment.MAINNET
): {
  depositAddress?: string;
  isLoading: boolean;
  generateAddress: () => Promise<void>;
} {
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateAddress = useCallback(async () => {
    const sdk = new AxelarAssetTransfer({ environment });
    if (address && depositAddress === null) {
      setIsLoading(true);
      const newAddress = await sdk.getDepositAddress(
        sourceChain,
        destChain,
        address,
        tokenMinDenom
      );
      setIsLoading(false);
      return newAddress;
    }
    return null;
  }, [
    environment,
    depositAddress,
    address,
    sourceChain,
    destChain,
    tokenMinDenom,
    setIsLoading,
  ]);

  const doGen = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        generateAddress()
          .then((address) => {
            if (address) {
              setDepositAddress(address);
            }
            resolve();
          })
          .catch((e) => {
            reject(`useDepositAddress: ${e.message}`);
          });
      }),
    [generateAddress, setDepositAddress]
  );

  useEffect(() => {
    if (address && generateOnMount) {
      doGen().catch((e) => console.error(e));
    }
  }, [address, generateOnMount, doGen]);

  return {
    depositAddress: depositAddress || undefined,
    isLoading,
    generateAddress: doGen,
  };
}
