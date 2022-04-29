import Image from "next/image";
import { FunctionComponent } from "react";
import { Button } from "../../../components/buttons/button";
import { useStore } from "../../../stores";
import { AssetCell as Cell } from "./types";

export const TransferButtonCell: FunctionComponent<
  { type: "withdraw" | "deposit" } & Partial<Cell>
> = ({ type, chainId, coinDenom, onWithdraw, onDeposit }) => {
  const { assetsStore } = useStore();

  const externalUrls = chainId
    ? assetsStore.getExternalTranferUrl?.(chainId)
    : undefined;

  return type === "withdraw" ? (
    chainId && coinDenom && onWithdraw ? (
      <TransferButton
        externalUrl={externalUrls?.withdrawUrl}
        label="Withdraw"
        action={() => onWithdraw?.(chainId, coinDenom)}
      />
    ) : null
  ) : chainId && coinDenom && onDeposit ? (
    <TransferButton
      externalUrl={externalUrls?.depositUrl}
      label="Deposit"
      action={() => onDeposit?.(chainId, coinDenom)}
    />
  ) : null;
};

const TransferButton: FunctionComponent<{
  externalUrl?: string;
  label: string;
  action: () => void;
}> = ({ externalUrl, label, action }) =>
  externalUrl ? (
    <a
      className="mx-auto flex justify-center items-center gap-0.5 pl-1 text-button font-subtitle2 base text-secondary-200"
      rel="noreferrer"
      href={externalUrl}
      target="_blank"
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
      size="xs"
      type="arrow-sm"
    >
      <span>{label}</span>
    </Button>
  );
