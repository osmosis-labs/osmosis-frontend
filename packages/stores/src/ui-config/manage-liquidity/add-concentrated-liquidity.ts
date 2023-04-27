import { TxChainSetter } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  IQueriesStore,
  ObservableQueryBalances,
} from "@keplr-wallet/stores";
import { Dec } from "@keplr-wallet/unit";
import { action, makeObservable, observable } from "mobx";

import { PriceRange } from "../../queries-external/token-pair-historical-chart/types";

/** Use to config user input UI for eventually sending a valid add concentrated liquidity msg.
 */
export class ObservableAddConcentratedLiquidityConfig extends TxChainSetter {
  @observable
  protected _poolId: string;

  @observable
  protected _sender: string;

  @observable.ref
  protected _queriesStore: IQueriesStore;
  @observable.ref
  protected _queryBalances: ObservableQueryBalances;

  /*
	 Used to get current view type of AddConcLiquidity modal
	 */
  @observable
  protected _conliqModalView: "overview" | "add_manual" | "add_managed" =
    "overview";

  /*
   Used to get historical range for price chart
   */
  @observable
  protected _conliqHistoricalRange: PriceRange = "7d";

  /*
   Used to get min and max range for adding concentrated liquidity
   */
  @observable
  protected _conliqRange: [Dec, Dec] = [new Dec(0), new Dec(0)];

  @observable
  protected _conliqFullRange: boolean = false;

  /*
   Used to get base and quote asset deposit for adding concentrated liquidity
   */
  @observable
  protected _conliqBaseDepositAmountIn: Dec = new Dec(0);

  @observable
  protected _conliqQuoteDepositAmountIn: Dec = new Dec(0);

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    poolId: string,
    sender: string,
    queriesStore: IQueriesStore,
    queryBalances: ObservableQueryBalances
  ) {
    super(chainGetter, initialChainId);

    this._poolId = poolId;
    this._queriesStore = queriesStore;
    this._queryBalances = queryBalances;
    this._sender = sender;

    makeObservable(this);
  }

  get poolId(): string {
    return this._poolId;
  }

  @action
  setPoolId(poolId: string) {
    this._poolId = poolId;
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  get sender(): string {
    return this._sender;
  }

  @action
  setConliqModalView = (
    viewType: "overview" | "add_manual" | "add_managed"
  ) => {
    this._conliqModalView = viewType;
  };

  get conliqModalView(): "overview" | "add_manual" | "add_managed" {
    return this._conliqModalView;
  }

  @action
  setConliqHistoricalRange = (range: PriceRange) => {
    this._conliqHistoricalRange = range;
  };

  get conliqHistoricalRange(): PriceRange {
    return this._conliqHistoricalRange;
  }

  @action
  setConliqMinRange = (min: Dec | number) => {
    this._conliqRange = [
      typeof min === "number" ? new Dec(min) : min,
      this._conliqRange[1],
    ];
  };

  @action
  setConliqMaxRange = (max: Dec | number) => {
    this._conliqRange = [
      this._conliqRange[0],
      typeof max === "number" ? new Dec(max) : max,
    ];
  };

  get conliqRange(): [Dec, Dec] {
    return this._conliqRange;
  }

  @action
  setConliqFullRange = (isFullRange: boolean) => {
    this._conliqFullRange = isFullRange;
  };

  get conliqFullRange(): boolean {
    return this._conliqFullRange;
  }

  @action
  setConliqBaseDepositAmountIn = (amount: Dec | number) => {
    this._conliqBaseDepositAmountIn =
      typeof amount === "number" ? new Dec(amount) : amount;
  };

  @action
  setConliqQuoteDepositAmountIn = (amount: Dec | number) => {
    this._conliqQuoteDepositAmountIn =
      typeof amount === "number" ? new Dec(amount) : amount;
  };

  get conliqBaseDepositAmountIn(): Dec {
    return this._conliqBaseDepositAmountIn;
  }

  get conliqQuoteDepositAmountIn(): Dec {
    return this._conliqQuoteDepositAmountIn;
  }
}
