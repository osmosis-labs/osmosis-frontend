import { FunctionComponent } from "react";
import { Button } from "../../../components/buttons/button";
import { AssetCell as Cell } from "./types";

export const TransferButtonCell: FunctionComponent<
  { type: "withdraw" | "deposit" } & Partial<Cell>
> = ({ type, chainId, onWithdraw, onDeposit }) =>
  type === "withdraw" ? (
    chainId && onWithdraw ? (
      <TransferButton label="Withdraw" action={() => onWithdraw?.(chainId)} />
    ) : null
  ) : chainId && onDeposit ? (
    <TransferButton label="Deposit" action={() => onDeposit?.(chainId)} />
  ) : null;

const TransferButton: FunctionComponent<{
  label: string;
  action: () => void;
}> = ({ label, action }) => (
  <Button className="m-auto" onClick={action} size="xs" type="arrow">
    <span>{label}</span>
  </Button>
);
