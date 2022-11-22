import { FunctionComponent } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { ModalBase, ModalBaseProps } from "./base";
import { Button } from "../components/buttons";
import { TokenSelect } from "../components/control";
import { Info } from "../components/alert";
import Image from "next/image";
import { useWindowSize } from "../hooks";
import classNames from "classnames";
import { UNSTABLE_MSG } from "../config";
import { useStore } from "../stores";
import { useTranslation } from "react-multi-lang";
import { observer } from "mobx-react-lite";

/** MOBILE: Pre transfer to select whether to deposit/withdraw */
export const PreTransferModal: FunctionComponent<
  ModalBaseProps & {
    selectedToken: CoinPretty;
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
  const { priceStore } = useStore();
  const { isMobile } = useWindowSize();
  const t = useTranslation();

  const tokenValue = priceStore.calculatePrice(
    selectedToken,
    priceStore.defaultVsCurrency
  );

  return (
    <ModalBase
      {...props}
      title={
        <TokenSelect
          selectedTokenDenom={selectedToken.denom}
          tokens={tokens}
          onSelect={(coinDenom) => onSelectToken(coinDenom)}
          sortByBalances
        />
      }
    >
      <div className="flex flex-col gap-7 pt-5">
        <div className="flex flex-col gap-2 px-5 items-left">
          <span className="caption text-osmoverse-400">
            {t("assets.table.preTransfer.currentBal")}
          </span>
          <h6>{selectedToken.trim(true).toString()}</h6>
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
                "flex w-full gap-1 text-button font-button h-10 justify-center items-center rounded-lg bg-wosmongton-200/30 border border-wosmongton-200",
                { "opacity-30": isUnstable }
              )}
              href={externalWithdrawUrl}
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
                height={8}
                width={8}
              />
            </a>
          ) : (
            <Button
              className="w-full h-10"
              mode="secondary"
              disabled={isUnstable}
              onClick={onWithdraw}
            >
              {t("assets.table.preTransfer.withdraw")}
            </Button>
          )}
          {externalDepositUrl ? (
            <a
              className={classNames(
                "flex w-full gap-1 h-10 text-button font-button justify-center items-center rounded-lg bg-wosmongton-200",
                { "opacity-30": isUnstable }
              )}
              href={externalDepositUrl}
              rel="noreferrer"
              target="_blank"
              style={
                isUnstable
                  ? { pointerEvents: "none", cursor: "default" }
                  : undefined
              }
            >
              {t("assets.table.preTransfer.deposit")}
              <Image
                alt="external transfer link"
                src="/icons/external-link-white.svg"
                height={8}
                width={8}
              />
            </a>
          ) : (
            <Button
              className="w-full h-10"
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
