import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Info } from "~/components/alert";
import { Button, buttonCVA } from "~/components/buttons";
import { TokenSelect } from "~/components/control";
import { UNSTABLE_MSG } from "~/config";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { useCoinFiatValue } from "~/hooks/queries/assets/use-coin-fiat-value";
import { ModalBase, ModalBaseProps } from "~/modals";
import { ObservableAssets } from "~/stores/assets/assets-store";

/** MOBILE: Pre transfer to select whether to deposit/withdraw */
export const PreTransferModal: FunctionComponent<
  ModalBaseProps & {
    selectedToken: ObservableAssets["unverifiedIbcBalances"][number];
    tokens: CoinPretty[];
    externalDepositUrl?: string;
    externalWithdrawUrl?: string;
    isUnstable?: boolean;
    onSelectToken: (coinDenom: string) => void;
    onWithdraw: () => void;
    onDeposit: () => void;
  }
> = observer((props) => {
  const {
    selectedToken,
    tokens,
    externalDepositUrl,
    externalWithdrawUrl,
    isUnstable,
    onSelectToken,
    onWithdraw,
    onDeposit,
  } = props;
  const { isMobile } = useWindowSize();
  const { t } = useTranslation();
  const tokenValue = useCoinFiatValue(selectedToken.balance);
  const isEthAsset = selectedToken.originBridgeInfo?.bridge === "axelar";
  return (
    <ModalBase
      {...props}
      title={
        <TokenSelect
          selectedTokenDenom={selectedToken.balance.denom}
          tokens={tokens}
          onSelect={(coinDenom) => onSelectToken(coinDenom)}
          sortByBalances
        />
      }
    >
      <div className="flex flex-col gap-7 pt-5">
        <div className="items-left flex flex-col gap-2 px-5">
          <span className="caption text-osmoverse-400">
            {t("assets.table.preTransfer.currentBal")}
          </span>
          <h6>{selectedToken.balance.trim(true).toString()}</h6>
          {tokenValue && (
            <span className="subtitle2 text-osmoverse-400">
              {tokenValue?.toString()}
            </span>
          )}
        </div>
        {isUnstable && <Info message={UNSTABLE_MSG} isMobile={isMobile} />}
        <div className="flex place-content-between gap-3 py-2">
          {externalWithdrawUrl ? (
            <a
              className={classNames(
                buttonCVA({
                  className:
                    "h-10 w-full gap-2 border-wosmongton-200/30 bg-wosmongton-200/30 hover:border-wosmongton-200/40 hover:bg-wosmongton-200/40",
                  mode: "primary",
                }),
                { "opacity-30": isUnstable }
              )}
              href={isUnstable ? "" : externalWithdrawUrl}
              rel="noreferrer"
              target="_blank"
              style={
                isUnstable
                  ? { pointerEvents: "none", cursor: "default" }
                  : undefined
              }
            >
              {t("assets.table.preTransfer.withdraw")}
              <Image
                alt="external transfer link"
                src="/icons/external-link-white.svg"
                height={12}
                width={12}
              />
            </a>
          ) : (
            <Button
              className="h-10 w-full"
              mode="secondary"
              disabled={isUnstable}
              onClick={onWithdraw}
            >
              {t("assets.table.preTransfer.withdraw")}
            </Button>
          )}
          {Boolean(externalDepositUrl) && (
            <a
              className={classNames(
                buttonCVA({
                  className:
                    "h-10 w-full gap-2 border-wosmongton-300 bg-wosmongton-300",
                  mode: "primary",
                }),
                { "opacity-30": isUnstable }
              )}
              href={isUnstable ? "" : externalDepositUrl}
              rel="noreferrer"
              target="_blank"
              style={
                isUnstable
                  ? { pointerEvents: "none", cursor: "default" }
                  : undefined
              }
            >
              <span>{t("assets.table.preTransfer.deposit")}</span>
              <Image
                alt="external transfer link"
                src="/icons/external-link-white.svg"
                height={12}
                width={12}
              />
            </a>
          )}
          {!isEthAsset && !externalDepositUrl && (
            <Button
              className="h-10 w-full"
              disabled={isUnstable}
              onClick={onDeposit}
            >
              {t("assets.table.preTransfer.deposit")}
            </Button>
          )}
        </div>
      </div>
    </ModalBase>
  );
});
