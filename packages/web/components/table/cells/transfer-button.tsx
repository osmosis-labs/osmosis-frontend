import { FunctionComponent } from "react";
import { Button } from "../../../components/buttons/button";
import { AssetCell as Cell } from "./types";

export const TransferButtonCell: FunctionComponent<
  { type: "withdraw" | "deposit" } & Partial<Cell>
> = ({ type, chainId, coinDenom, onWithdraw, onDeposit }) =>
  type === "withdraw" ? (
    chainId && coinDenom && onWithdraw ? (
      <TransferButton
        label="Withdraw"
        action={() => onWithdraw?.(chainId, coinDenom)}
      />
    ) : null
  ) : chainId && coinDenom && onDeposit ? (
    <TransferButton
      label="Deposit"
      action={() => onDeposit?.(chainId, coinDenom)}
    />
  ) : null;

const TransferButton: FunctionComponent<{
  label: string;
  action: () => void;
}> = ({ label, action }) => (
  <Button
    className="m-auto text-button"
    onClick={action}
    size="xs"
    type="arrow-sm"
  >
    <span>{label}</span>
  </Button>
);
