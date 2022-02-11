import { FunctionComponent } from "react";
import { Button } from "../../../components/buttons/button";
import { Cell } from "./types";

export const DepositButtonCell: FunctionComponent<Partial<Cell>> = ({
  chainId,
  onDeposit,
}) =>
  chainId && onDeposit ? (
    <Button
      className="m-auto"
      onClick={() => onDeposit?.(chainId)}
      size="xs"
      type="arrow"
    >
      <span>Deposit</span>
    </Button>
  ) : null;

export const WidthrawButtonCell: FunctionComponent<Partial<Cell>> = ({
  chainId,
  onWithdraw,
}) =>
  chainId && onWithdraw ? (
    <Button
      className="m-auto"
      onClick={() => onWithdraw?.(chainId)}
      size="xs"
      type="arrow"
    >
      <span>Withdraw</span>
    </Button>
  ) : null;
