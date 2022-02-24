import { DeepReadonly } from "utility-types";
import { MsgOpt } from "@keplr-wallet/stores";
import { OsmosisAccount } from "./osmosis";

export interface HasOsmosisAccount {
  osmosis: DeepReadonly<OsmosisAccount>;
}

export interface OsmosisMsgOpts {
  readonly createPool: MsgOpt;
  readonly joinPool: MsgOpt & {
    shareCoinDecimals: number;
  };
  readonly joinSwapExternAmountIn: MsgOpt & {
    shareCoinDecimals: number;
  };
  readonly exitPool: MsgOpt & {
    shareCoinDecimals: number;
  };
  readonly swapExactAmountIn: MsgOpt;
  readonly swapExactAmountOut: MsgOpt;
  readonly lockTokens: MsgOpt;
  readonly beginUnlocking: MsgOpt;
  readonly unlockPeriodLock: MsgOpt;
}
