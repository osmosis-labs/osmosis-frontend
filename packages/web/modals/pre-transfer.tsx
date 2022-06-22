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
> = (props) => {
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
      <div className="flex flex-col gap-5 pt-5">
        <div className="flex flex-col gap-2 items-center">
          <h6>{selectedToken.currency.coinDenom}</h6>
          <span className="subtitle2 text-iconDefault">
            {selectedToken.trim(true).toString()}
          </span>
        </div>
        {isUnstable && <Info message={UNSTABLE_MSG} isMobile={isMobile} />}
        <div className="flex place-content-between gap-5 py-2">
          {externalDepositUrl ? (
            <a
              className={classNames(
                "flex w-full gap-1 h-10 text-button font-button justify-center items-center rounded-lg bg-primary-200",
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
              Deposit
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
              Deposit
            </Button>
          )}
          {externalWithdrawUrl ? (
            <a
              className={classNames(
                "flex w-full gap-1 text-button font-button h-10 justify-center items-center rounded-lg bg-primary-200/30 border border-primary-200",
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
              Withdraw
              <Image
                alt="external transfer link"
                src="/icons/external-link-white.svg"
                height={8}
                width={8}
              />
            </a>
          ) : (
            <Button
              className="w-full h-10 bg-primary-200/30"
              type="outline"
              disabled={isUnstable}
              onClick={onWithdraw}
            >
              Withdraw
            </Button>
          )}
        </div>
      </div>
    </ModalBase>
  );
};
