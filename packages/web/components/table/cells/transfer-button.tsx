import Image from "next/image";
import classNames from "classnames";
import { FunctionComponent } from "react";
import { Button } from "../../../components/buttons/button";
import { AssetCell as Cell } from "./types";

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
}) =>
  type === "withdraw" ? (
    chainId && coinDenom && onWithdraw ? (
      <TransferButton
        disabled={isUnstable}
        externalUrl={withdrawUrlOverride}
        label="Withdraw"
        action={() => onWithdraw?.(chainId, coinDenom)}
      />
    ) : null
  ) : chainId && coinDenom && onDeposit ? (
    <TransferButton
      disabled={isUnstable}
      externalUrl={depositUrlOverride}
      label="Deposit"
      action={() => onDeposit?.(chainId, coinDenom)}
    />
  ) : null;

const TransferButton: FunctionComponent<{
  externalUrl?: string;
  disabled?: boolean;
  label: string;
  action: () => void;
}> = ({ externalUrl, disabled, label, action }) =>
  externalUrl ? (
    <a
      className={classNames(
        "mx-auto flex justify-center items-center gap-0.5 pl-1 pt-2 text-button font-subtitle2 base text-secondary-200",
        { "opacity-30": disabled }
      )}
      rel="noreferrer"
      href={externalUrl}
      target="_blank"
      style={
        disabled ? { pointerEvents: "none", cursor: "default" } : undefined
      }
    >
      {label}
      <Image
        alt="external transfer link"
        src="/icons/external-link-secondary-200.svg"
        height={8}
        width={8}
      />
    </a>
  ) : (
    <Button
      className="m-auto text-button"
      onClick={action}
      disabled={disabled}
      size="xs"
      type="arrow-sm"
    >
      <span>{label}</span>
    </Button>
  );
