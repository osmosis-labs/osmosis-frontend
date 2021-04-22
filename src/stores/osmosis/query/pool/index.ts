import { GAMMPoolData } from "../../pool/types";
import { GAMMPool } from "../../pool";
import { ChainGetter } from "@keplr-wallet/stores";
import { CoinPretty, DecUtils, IntPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable, observable } from "mobx";

export class ObservablePool {
  @observable.ref
  protected readonly pool: GAMMPool;

  constructor(
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    data: GAMMPoolData
  ) {
    this.pool = new GAMMPool(data);

    makeObservable(this);
  }

  get id(): string {
    return this.pool.id;
  }

  @computed
  get swapFee(): IntPretty {
    let dec = this.pool.swapFee;
    dec = dec.mul(DecUtils.getPrecisionDec(5));

    // XXX: IntPretty에서 0.5같이 정수부가 0인 Dec이 들어가면 precision이 제대로 설정되지않는 버그가 있기 때문에
    // 임시로 5를 곱하고 precision을 3으로 낮춰서 10^2가 곱해진 효과를 낸다.
    return new IntPretty(dec)
      .precision(3)
      .maxDecimals(4)
      .trim(true);
  }

  @computed
  get poolAssets(): {
    weight: IntPretty;
    amount: CoinPretty;
  }[] {
    const primitives = this.pool.poolAssets;

    return primitives.map(primitive => {
      const coinPrimitive = primitive.token;
      const currency = this.chainGetter
        .getChain(this.chainId)
        .currencies.find(cur => cur.coinMinimalDenom === coinPrimitive.denom);
      if (!currency) {
        throw new Error("Unknown currency");
      }

      return {
        weight: new IntPretty(new Int(primitive.weight)),
        amount: new CoinPretty(currency, new Int(coinPrimitive.amount))
      };
    });
  }
}
