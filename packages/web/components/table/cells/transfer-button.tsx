import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useEffect } from "react";
import { useState } from "react";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { AssetCell as Cell } from "~/components/table/cells/types";
import { useStore } from "~/stores";
import { noop } from "~/utils/function";

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
    const t = useTranslation();
    const { accountStore } = useStore();
    const [_isSupported, setIsSupported] = useState(true);

    const wallet = accountStore.getWallet(chainId ?? "");

    useEffect(() => {
      wallet
        ?.supportsChain(chainId ?? "")
        .then(setIsSupported)
        .catch(noop);
    }, [chainId, wallet]);

    const isSupported = _isSupported || withdrawUrlOverride;

    return type === "withdraw" ? (
      chainId && coinDenom && onWithdraw ? (
        <TransferButton
          disabled={!isSupported || isUnstable}
          externalUrl={withdrawUrlOverride}
          label={t("assets.table.withdrawButton")}
          action={() => onWithdraw?.(chainId, coinDenom, withdrawUrlOverride)}
        />
      ) : null
    ) : chainId && coinDenom && onDeposit ? (
      <TransferButton
        disabled={!isSupported || isUnstable}
        externalUrl={depositUrlOverride}
        label={t("assets.table.depositButton")}
        action={() => onDeposit?.(chainId, coinDenom, depositUrlOverride)}
      />
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
    <Button mode="text" className="gap-2" onClick={action} disabled={disabled}>
      <span>{label}</span>

      <div className="h-fit shrink-0">
        <Icon id="chevron-right" width={8} height={14} />
      </div>
    </Button>
  );
};
