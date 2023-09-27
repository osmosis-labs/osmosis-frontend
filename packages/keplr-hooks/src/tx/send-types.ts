import { IAccountStore, MsgOpt } from "@osmosis-labs/keplr-stores";

export type AccountStore = IAccountStore<{
  cosmos?: {
    readonly msgOpts: {
      readonly send: {
        readonly native: MsgOpt;
      };
    };
  };
  cosmwasm?: {
    readonly msgOpts: {
      readonly send: {
        readonly cw20: Pick<MsgOpt, "gas">;
      };
    };
  };
}>;
