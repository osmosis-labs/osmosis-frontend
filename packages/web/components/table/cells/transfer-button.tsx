import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, useState } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { AssetCell as Cell } from "~/components/table/cells/types";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";
import { UnstableAssetWarning } from "~/modals/unstable-asset-warning";
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
    isUnstable,
    onWithdraw,
    onDeposit,
  }) => {
    const { t } = useTranslation();
    const { accountStore } = useStore();

    const onOperation = type === "deposit" ? onDeposit : onWithdraw;

    const shouldRender = chainId && coinDenom && onOperation;
    if (!shouldRender) return null;

    const isChainSupported = Boolean(
      accountStore.connectedWalletSupportsChain(chainId ?? "")?.value ?? true
    );
    const isOperationSupported =
      type === "deposit"
        ? isChainSupported || Boolean(depositUrlOverride)
        : isChainSupported || Boolean(withdrawUrlOverride);

    const notSupportedTooltipText = t("assetNotCompatible");

    const [showUnstableAssetWarning, setShowUnstableAssetWarning] =
      useState(false);
    const operationUrlOverride =
      type === "deposit" ? depositUrlOverride : withdrawUrlOverride;

    const operationLabel = t(`assets.table.${type}Button`);

    const action = () => onOperation(chainId, coinDenom, operationUrlOverride);

    return (
      <>
        <Tooltip
          disabled={isOperationSupported}
          content={notSupportedTooltipText}
        >
          <TransferButton
            disabled={!isOperationSupported}
            externalUrl={operationUrlOverride}
            label={operationLabel}
            action={() =>
              isUnstable ? setShowUnstableAssetWarning(true) : action()
            }
          />
        </Tooltip>
        <UnstableAssetWarning
          type={type}
          isOpen={showUnstableAssetWarning}
          onRequestClose={() => setShowUnstableAssetWarning(false)}
          onContinue={action}
        />
      </>
    );
  }
);

const TransferButton: FunctionComponent<{
  externalUrl?: string;
  disabled?: boolean;
  label: string;
  action: () => void;
}> = ({ externalUrl, disabled, label, action }) =>
  externalUrl ? (
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
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        action();
      }}
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
    <Button
      mode="text"
      className="gap-2"
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
