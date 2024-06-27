import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { AssetCell as Cell } from "~/components/table/cells/types";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";

export const TransferButtonCell: FunctionComponent<
  {
    type: "withdraw" | "deposit";
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
  } & Partial<Cell>
> = observer(
  ({
    type,
    depositUrlOverride,
    withdrawUrlOverride,
    chainId,
    coinDenom,
    onWithdraw,
    onDeposit,
  }) => {
    const { t } = useTranslation();
    const { accountStore } = useStore();

    const isChainSupported = Boolean(
      accountStore.connectedWalletSupportsChain(chainId ?? "")?.value ?? true
    );

    const isDepositSupported = isChainSupported || Boolean(depositUrlOverride);
    const isWithdrawSupported =
      isChainSupported || Boolean(withdrawUrlOverride);
    const notSupportedTooltipText = t("assetNotCompatible");

    return type === "withdraw" ? (
      chainId && coinDenom && onWithdraw ? (
        <Tooltip
          disabled={isWithdrawSupported}
          content={notSupportedTooltipText}
        >
          <TransferButton
            disabled={!isWithdrawSupported}
            externalUrl={withdrawUrlOverride}
            label={t("assets.table.withdrawButton")}
            action={() => onWithdraw?.(chainId, coinDenom, withdrawUrlOverride)}
          />
        </Tooltip>
      ) : null
    ) : chainId && coinDenom && onDeposit ? (
      <Tooltip disabled={isDepositSupported} content={notSupportedTooltipText}>
        <TransferButton
          disabled={!isDepositSupported}
          externalUrl={depositUrlOverride}
          label={t("assets.table.depositButton")}
          action={() => onDeposit?.(chainId, coinDenom, depositUrlOverride)}
        />
      </Tooltip>
    ) : null;
  }
);

const TransferButton: FunctionComponent<{
  externalUrl?: string;
  disabled?: boolean;
  label: string;
  action: () => void;
}> = ({ externalUrl, disabled, label, action }) => {
  return externalUrl ? (
    <Button
      variant="ghost"
      size="md"
      className="flex gap-2 text-wosmongton-200 hover:text-rust-200"
      disabled={disabled}
      asChild
    >
      <a
        rel="noreferrer"
        target="_blank"
        href={externalUrl}
        onClick={(event) => {
          event.stopPropagation();
          action();
        }}
      >
        <span>{label}</span>
        <Image
          alt="external transfer link"
          src="/icons/external-link.svg"
          height={13}
          width={13}
        />
      </a>
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="md"
      className="flex gap-2 text-wosmongton-200 hover:text-rust-200"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        action();
      }}
      disabled={disabled}
    >
      <span>{label}</span>

      <div className="h-fit shrink-0">
        <Icon id="chevron-right" width={8} height={14} />
      </div>
    </Button>
  );
};
