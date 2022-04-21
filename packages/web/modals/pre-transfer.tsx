import { FunctionComponent } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import { ModalBase, ModalBaseProps } from "./base";
import { Button } from "../components/buttons";
// import { TokenSelect } from "../components/control";

export const PreTransfer: FunctionComponent<
  ModalBaseProps & {
    selectedToken: CoinPretty;
    tokens: Currency[];
    onSelectToken: (coinDenom: string) => void;
    onWithdraw: () => void;
    onDeposit: () => void;
  }
> = (props) => {
  const { selectedToken, onWithdraw, onDeposit } = props;

  return (
    <ModalBase {...props} title={<div></div>}>
      <div className="flex flex-col gap-5 pt-5">
        <div className="flex flex-col gap-2 items-center">
          <h6>{selectedToken.currency.coinDenom}</h6>
          <span className="subtitle2 text-iconDefault">
            {selectedToken.toString()}
          </span>
        </div>
        <div className="flex place-content-between gap-5 py-2">
          <Button className="w-full h-10" onClick={onDeposit}>
            Deposit
          </Button>
          <Button
            className="w-full h-10 bg-primary-200/30"
            type="outline"
            onClick={onWithdraw}
          >
            Withdraw
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};
