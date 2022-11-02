import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { ObservableTransferUIConfig, TransferDir } from "../../stores/assets";

/** Bidirectionally sets/gets window query params transfer/direction `transfer=DENOM&direction=TransferDir` and sets in assets config object. */
export function useTokenTransferQueryParams(
  transferConfig: ObservableTransferUIConfig,
  isInModal = false
) {
  const router = useRouter();
  const firstQueryEffectChecker = useRef(false);
  // Reads query params and sets appropriate asset config state
  useEffect(() => {
    if (isInModal || !transferConfig || firstQueryEffectChecker.current) {
      return;
    }
    const directionOfTransfer = router.query.direction;
    const transferDenom = router.query.transfer;
    if (
      directionOfTransfer !== "withdraw" &&
      directionOfTransfer !== "deposit"
    ) {
      return;
    }
    if (transferDenom) {
      transferConfig.transferAsset(
        directionOfTransfer,
        transferDenom as string
      );
    } else transferConfig.startTransfer(directionOfTransfer);
    firstQueryEffectChecker.current = true;
  }, [router.query.transfer, router.query.direction]);

  return {
    setTransferQueryParams: (direction: TransferDir, coinDenom?: string) => {
      router.query.direction = direction;
      if (coinDenom) {
        router.query.transfer = coinDenom;
      }
      router.push(router);
    },
  };
}
