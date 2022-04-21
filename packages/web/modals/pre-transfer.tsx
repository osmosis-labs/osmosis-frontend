import { FunctionComponent } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { ModalBase, ModalBaseProps } from "./base";
import { Button } from "../components/buttons";
import { TokenSelect } from "../components/control";

export const PreTransferModal: FunctionComponent<
  ModalBaseProps & {
    selectedToken: CoinPretty;
    tokens: CoinPretty[];
    onSelectToken: (coinDenom: string) => void;
    onWithdraw: () => void;
    onDeposit: () => void;
  }
> = (props) => {
  const { selectedToken, tokens, onSelectToken, onWithdraw, onDeposit } = props;

  return (
    <ModalBase
      {...props}
      title={
        <TokenSelect
          selectedTokenDenom={selectedToken.denom}
          tokens={tokens}
          onSelect={(currency) => onSelectToken(currency.denom)}
          sortByBalances
        />
      }
    >
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
