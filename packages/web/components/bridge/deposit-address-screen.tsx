import { MinimalAsset } from "@osmosis-labs/types";
import { shorten } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { useScreenManager } from "~/components/screen-manager";
import { Tooltip } from "~/components/tooltip";
import { IconButton } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { BridgeScreen } from "~/hooks/bridge";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";

interface DepositAddressScreenProps {
  direction: "deposit" | "withdraw";
  canonicalAsset: MinimalAsset;
  chainSelection: React.ReactNode;
  fromChain: BridgeChainWithDisplayInfo;
}

export const DepositAddressScreen = observer(
  ({
    direction,
    canonicalAsset,
    chainSelection,
    fromChain,
  }: DepositAddressScreenProps) => {
    const { setCurrentScreen } = useScreenManager();
    const { t } = useTranslation();
    return (
      <div className="relative flex w-full flex-col items-center justify-center p-4 text-osmoverse-200 md:py-2 md:px-0">
        <div className="mb-8 flex flex-col gap-3">
          <div className="flex w-full items-center justify-center gap-3 text-body1 font-body1">
            {!canonicalAsset ? (
              <SkeletonLoader className="h-8 w-full max-w-sm md:h-4" />
            ) : (
              <>
                <span>
                  {direction === "deposit"
                    ? t("transfer.deposit")
                    : t("transfer.withdraw")}
                </span>{" "}
                <button
                  className="flex items-center gap-3"
                  onClick={() => setCurrentScreen(BridgeScreen.Asset)}
                >
                  <Image
                    width={32}
                    height={32}
                    src={canonicalAsset.coinImageUrl ?? "/"}
                    alt="token image"
                  />{" "}
                  <span>
                    {canonicalAsset.coinName} ({canonicalAsset.coinDenom})
                  </span>
                </button>
              </>
            )}
          </div>
          <p className="text-h5 font-h5 text-white-full md:text-h6 md:font-h6">
            Send from your wallet or exchange
          </p>
        </div>

        {chainSelection}

        <div className="z-20 flex w-full items-center justify-between rounded-2xl bg-osmoverse-850 p-4">
          <div className="flex items-center gap-2">
            <Tooltip content="Show QR code">
              <IconButton
                icon={<Icon id="qr" className="text-osmoverse-400" />}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800 hover:!bg-osmoverse-700 active:!bg-osmoverse-800"
                aria-label="Show QR code"
              />
            </Tooltip>

            <div className="flex flex-col">
              <p className="subtitle1 text-white-full">
                Your {canonicalAsset.coinDenom} deposit address
              </p>
              <p className="text-osmoverse-300">
                {shorten("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", {
                  prefixLength: 9,
                  suffixLength: 5,
                })}
              </p>
            </div>
          </div>
          <IconButton
            icon={<Icon id="copy" className="text-osmoverse-400" />}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800 hover:!bg-osmoverse-700 active:!bg-osmoverse-800"
            aria-label="Copy address"
          />
        </div>

        <div className="z-10 -mt-2 flex w-full items-center gap-4 rounded-b-2xl bg-osmoverse-1000 px-4 pb-4 pt-6">
          <Icon
            id="alert-triangle"
            width={24}
            height={24}
            className="flex-shrink-0 self-start text-rust-400"
          />
          <p className="body2 text-osmoverse-200">
            This address can only receive {canonicalAsset.coinDenom} from{" "}
            {fromChain.prettyName} network.
            <br />
            Sending any other assets may result in permanent loss.
          </p>
        </div>
      </div>
    );
  }
);
