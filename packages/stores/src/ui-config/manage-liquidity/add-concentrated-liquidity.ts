import { TxChainSetter } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  IQueriesStore,
  ObservableQueryBalances,
} from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import { minSpotPrice, priceToTick, tickToSqrtPrice } from "@osmosis-labs/math";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { action, makeObservable, observable } from "mobx";

import { PriceRange } from "../../queries-external/token-pair-historical-chart/types";

/** Use to config user input UI for eventually sending a valid add concentrated liquidity msg.
 */
export class ObservableAddConcentratedLiquidityConfig extends TxChainSetter {
  @observable
  protected _poolId: string;

  @observable
  protected _sender: string;

  @observable
  protected _pool: ConcentratedLiquidityPool;

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
  protected _conliqRange: [Dec, Dec] = [minSpotPrice, minSpotPrice];

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
    queryBalances: ObservableQueryBalances,
    pool: ConcentratedLiquidityPool
  ) {
    super(chainGetter, initialChainId);

    this._poolId = poolId;
    this._pool = pool;
    this._queriesStore = queriesStore;
    this._queryBalances = queryBalances;
    this._sender = sender;

    makeObservable(this);
  }

  get poolId(): string {
    return this._poolId;
  }

  get pool(): ConcentratedLiquidityPool {
    return this._pool;
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
    const tick = priceToTick(
      typeof min === "number" ? new Dec(min) : min,
      this.pool.exponentAtPriceOne
    );
    const derivedPrice = tickToSqrtPrice(tick, this.pool.exponentAtPriceOne);
    this._conliqRange = [derivedPrice.mul(derivedPrice), this._conliqRange[1]];
  };

  @action
  setConliqMaxRange = (max: Dec | number) => {
    const tick = priceToTick(
      typeof max === "number" ? new Dec(max) : max,
      this.pool.exponentAtPriceOne
    );
    const derivedPrice = tickToSqrtPrice(tick, this.pool.exponentAtPriceOne);
    this._conliqRange = [this._conliqRange[0], derivedPrice.mul(derivedPrice)];
  };

  get conliqRange(): [Dec, Dec] {
    return this._conliqRange;
  }

  get conliqTickRange(): [Int, Int] {
    return [
      priceToTick(this._conliqRange[0], this.pool.exponentAtPriceOne),
      priceToTick(this._conliqRange[1], this.pool.exponentAtPriceOne),
    ];
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
