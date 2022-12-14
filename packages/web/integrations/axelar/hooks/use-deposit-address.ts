import { useState, useEffect, useCallback } from "react";
import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";

export function useDepositAddress(
  sourceChain: string,
  destChain: string,
  address: string | undefined,
  coinMinimalDenom: string,
  generateOnMount = true,
  environment = Environment.MAINNET
): {
  depositAddress?: string;
  isLoading: boolean;
  generateAddress: () => Promise<void>;
} {
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAddress, setLastAddress] = useState<string | null>(null);

  const generateAddress = useCallback(async () => {
    if (address) {
      setIsLoading(true);
      new AxelarAssetTransfer({ environment })
        .getDepositAddress(sourceChain, destChain, address, coinMinimalDenom)
        .then((generatedAddress) => {
          setDepositAddress(generatedAddress);
        })
        .catch((e: any) => {
          console.error("useDepositAddress > getDepositAddress:", e.message);
        })
        .finally(() => setIsLoading(false));
    }
    return null;
  }, [
    environment,
    address,
    sourceChain,
    destChain,
    coinMinimalDenom,
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
    if (address && generateOnMount && address != lastAddress) {
      setLastAddress(address);
      setDepositAddress(null);
      doGen().catch((e) => console.error(e));
    }
  }, [address, generateOnMount, doGen]);

  return {
    depositAddress: depositAddress || undefined,
    isLoading,
    generateAddress: doGen,
  };
}
