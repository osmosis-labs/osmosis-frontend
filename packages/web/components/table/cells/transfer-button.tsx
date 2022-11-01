import Image from "next/image";
import classNames from "classnames";
import { FunctionComponent } from "react";
import { WalletStatus } from "@keplr-wallet/stores";
import { AssetCell as Cell } from "./types";
import { useStore } from "../../../stores";
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
  onBuyOsmo,
}) => {
  const t = useTranslation();
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.osmosis.chainId);

  return type === "withdraw" ? (
    chainId && coinDenom && onWithdraw ? (
      <TransferButton
        disabled={isUnstable}
        externalUrl={withdrawUrlOverride}
        label={t("assets.table.withdrawButton")}
        action={() => onWithdraw?.(chainId, coinDenom, withdrawUrlOverride)}
      />
    ) : null
  ) : chainId && coinDenom && (onDeposit || onBuyOsmo) ? (
    <TransferButton
      disabled={
        isUnstable ||
        (onBuyOsmo && account.walletStatus !== WalletStatus.Loaded)
      }
      externalUrl={depositUrlOverride}
      label={
        onBuyOsmo ? t("assets.table.buyOsmo") : t("assets.table.depositButton")
      }
      action={
        onBuyOsmo
          ? onBuyOsmo
          : () => onDeposit?.(chainId, coinDenom, depositUrlOverride)
      }
    />
  ) : null;
};

const TransferButton: FunctionComponent<{
  externalUrl?: string;
  disabled?: boolean;
  label: string;
  action: () => void;
}> = ({ externalUrl, disabled, label, action }) =>
  externalUrl ? (
    <a
      className={classNames(
        "mx-auto flex justify-center items-center gap-1 pt-2 subtitle1 text-wosmongton-200",
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
      <Image
        alt="external transfer link"
        src="/icons/external-link.svg"
        height={13}
        width={13}
      />
    </a>
  ) : (
    <button
      className="flex items-center gap-1 text-wosmongton-200 m-auto subtitle1"
      onClick={action}
      disabled={disabled}
    >
      <span>{label}</span>
      <Image
        alt="chevron"
        src="/icons/chevron-right.svg"
        height={13}
        width={13}
      />
    </button>
  );
