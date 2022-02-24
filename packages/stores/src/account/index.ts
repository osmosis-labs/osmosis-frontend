import deepmerge from "deepmerge";
import { DeepReadonly } from "utility-types";
import {
  ChainGetter,
  QueriesStore,
  AccountSetBase,
  CosmosMsgOpts,
  HasCosmosQueries,
  AccountWithCosmos,
  QueriesSetBase,
  AccountSetOpts,
  CosmosAccount,
  HasCosmosAccount,
  HasCosmwasmAccount,
  HasCosmwasmQueries,
  CosmwasmAccount,
  AccountWithCosmwasm,
  CosmwasmMsgOpts,
} from "@keplr-wallet/stores";
import { HasOsmosisQueries } from "../queries";
import { HasOsmosisAccount, OsmosisMsgOpts } from "./types";
import { OsmosisAccount } from "./osmosis";

/** The root account set for Osmosis. Contains Cosmos, Osmosis, and Cosmwasm account & messaging/tx functionality. */
export class Account
  extends AccountSetBase<
    CosmosMsgOpts & OsmosisMsgOpts & CosmwasmMsgOpts,
    HasCosmosQueries & HasOsmosisQueries & HasCosmwasmQueries
  >
  implements HasCosmosAccount, HasOsmosisAccount, HasCosmwasmAccount
{
  public readonly cosmos: DeepReadonly<CosmosAccount>;
  public readonly osmosis: DeepReadonly<OsmosisAccount>;
  public readonly cosmwasm: DeepReadonly<CosmwasmAccount>;

  static readonly defaultMsgOpts: CosmosMsgOpts &
    OsmosisMsgOpts &
    CosmwasmMsgOpts = deepmerge(
    AccountWithCosmos.defaultMsgOpts,
    deepmerge(AccountWithCosmwasm.defaultMsgOpts, {
      createPool: {
        type: "osmosis/gamm/create-pool",
        gas: 250000,
      },
      joinPool: {
        type: "osmosis/gamm/join-pool",
        gas: 140000,
        shareCoinDecimals: 18,
      },
      joinSwapExternAmountIn: {
        type: "osmosis/gamm/join-swap-extern-amount-in",
        gas: 140000,
        shareCoinDecimals: 18,
      },
      exitPool: {
        type: "osmosis/gamm/exit-pool",
        gas: 140000,
        shareCoinDecimals: 18,
      },
      swapExactAmountIn: {
        type: "osmosis/gamm/swap-exact-amount-in",
        gas: 250000,
      },
      swapExactAmountOut: {
        type: "osmosis/gamm/swap-exact-amount-out",
        gas: 250000,
      },
      lockTokens: {
        type: "osmosis/lockup/lock-tokens",
        gas: 250000,
      },
      beginUnlocking: {
        type: "osmosis/lockup/begin-unlock-period-lock",
        // Gas per msg
        gas: 140000,
      },
      unlockPeriodLock: {
        type: "osmosis/lockup/unlock-period-lock",
        // Gas per msg
        gas: 140000,
      },
    })
  );

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasCosmosQueries & HasOsmosisQueries & HasCosmwasmQueries
    >,
    protected readonly opts: AccountSetOpts<
      CosmosMsgOpts & OsmosisMsgOpts & CosmwasmMsgOpts
    >
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.cosmos = new CosmosAccount(
      this as AccountSetBase<CosmosMsgOpts, HasCosmosQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
    this.osmosis = new OsmosisAccount(
      this as AccountSetBase<OsmosisMsgOpts, HasOsmosisQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
    this.cosmwasm = new CosmwasmAccount(
      this as AccountSetBase<CosmwasmMsgOpts, HasCosmwasmQueries>,
      chainGetter,
      chainId,
      queriesStore
    );
  }
}

export * from "./types";
