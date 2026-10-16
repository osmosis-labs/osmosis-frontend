import type { KVStore } from "@osmosis-labs/utils";

import { ChainGetter } from "../../../common";
import { ObservableChainQuery } from "../../chain-query";
import { MintingInflation } from "./types";

export class ObservableQueryMintingInfation extends ObservableChainQuery<MintingInflation> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/cosmos/mint/v1beta1/inflation");
  }
}
