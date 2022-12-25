import Image from "next/image";
import classNames from "classnames";
import { FunctionComponent, useState } from "react";
import { AssetCell as Cell } from "./types";
import { useTranslation } from "react-multi-lang";

export const TransferButtonCell: FunctionComponent<
  {
    type: "withdraw" | "deposit";
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
  } & Partial<Cell>
> = ({
  type,
  depositUrlOverride,
  withdrawUrlOverride,
  chainId,
  coinDenom,
  isUnstable,
  onWithdraw,
  onDeposit,
}) => {
  const t = useTranslation();

  return type === "withdraw" ? (
    chainId && coinDenom && onWithdraw ? (
      <TransferButton
        disabled={isUnstable}
        externalUrl={withdrawUrlOverride}
        label={t("assets.table.withdrawButton")}
        action={() => onWithdraw?.(chainId, coinDenom, withdrawUrlOverride)}
      />
    ) : null
  ) : chainId && coinDenom && onDeposit ? (
    <TransferButton
      disabled={isUnstable}
      externalUrl={depositUrlOverride}
      label={t("assets.table.depositButton")}
      action={() => onDeposit?.(chainId, coinDenom, depositUrlOverride)}
    />
  ) : null;
};

const TransferButton: FunctionComponent<{
  externalUrl?: string;
  disabled?: boolean;
  label: string;
  action: () => void;
}> = ({ externalUrl, disabled, label, action }) => {
  const [isHovering, setIsHovering] = useState(false);
  return externalUrl ? (
    <a
      className={classNames(
        "subtitle1 flex shrink-0 items-center gap-1 pt-2 text-wosmongton-200 lg:pt-0",
        { "opacity-30": disabled }
      )}
      rel="noreferrer"
      href={externalUrl}
      target="_blank"
      style={
        disabled ? { pointerEvents: "none", cursor: "default" } : undefined
      }
      onClick={action}
    >
      {label}
      <div className="w-fit shrink-0">
        <Image
          alt="external transfer link"
          src="/icons/external-link.svg"
          height={13}
          width={13}
        />
      </div>
    </a>
  ) : (
    <button
      className="subtitle1 flex items-center gap-1 text-wosmongton-200 transition-colors hover:text-rust-300 disabled:opacity-30 hover:disabled:text-wosmongton-200"
      onClick={action}
      disabled={disabled}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <span className="mb-[3.3px]">{label}</span>
      {isHovering ? (
        <div className="h-fit shrink-0">
          <Image
            alt="chevron"
            src="/icons/chevron-right-rust.svg"
            height={13}
            width={13}
            priority={true}
          />
        </div>
      ) : (
        <div className="h-fit shrink-0">
          <Image
            alt="chevron"
            src="/icons/chevron-right.svg"
            height={13}
            width={13}
            priority={true}
          />
        </div>
      )}
    </button>
  );
};
