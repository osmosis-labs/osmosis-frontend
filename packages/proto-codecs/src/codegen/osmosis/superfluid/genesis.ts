//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../binary";
import { Params, ParamsAmino, ParamsSDKType } from "./params";
import {
  LockIdIntermediaryAccountConnection,
  LockIdIntermediaryAccountConnectionAmino,
  LockIdIntermediaryAccountConnectionSDKType,
  OsmoEquivalentMultiplierRecord,
  OsmoEquivalentMultiplierRecordAmino,
  OsmoEquivalentMultiplierRecordSDKType,
  SuperfluidAsset,
  SuperfluidAssetAmino,
  SuperfluidAssetSDKType,
  SuperfluidIntermediaryAccount,
  SuperfluidIntermediaryAccountAmino,
  SuperfluidIntermediaryAccountSDKType,
} from "./superfluid";
/** GenesisState defines the module's genesis state. */
export interface GenesisState {
  params: Params;
  /**
   * superfluid_assets defines the registered superfluid assets that have been
   * registered via governance.
   */
  superfluidAssets: SuperfluidAsset[];
  /**
   * osmo_equivalent_multipliers is the records of osmo equivalent amount of
   * each superfluid registered pool, updated every epoch.
   */
  osmoEquivalentMultipliers: OsmoEquivalentMultiplierRecord[];
  /**
   * intermediary_accounts is a secondary account for superfluid staking that
   * plays an intermediary role between validators and the delegators.
   */
  intermediaryAccounts: SuperfluidIntermediaryAccount[];
  intemediaryAccountConnections: LockIdIntermediaryAccountConnection[];
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.superfluid.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the module's genesis state. */
export interface GenesisStateAmino {
  params?: ParamsAmino;
  /**
   * superfluid_assets defines the registered superfluid assets that have been
   * registered via governance.
   */
  superfluid_assets?: SuperfluidAssetAmino[];
  /**
   * osmo_equivalent_multipliers is the records of osmo equivalent amount of
   * each superfluid registered pool, updated every epoch.
   */
  osmo_equivalent_multipliers?: OsmoEquivalentMultiplierRecordAmino[];
  /**
   * intermediary_accounts is a secondary account for superfluid staking that
   * plays an intermediary role between validators and the delegators.
   */
  intermediary_accounts?: SuperfluidIntermediaryAccountAmino[];
  intemediary_account_connections?: LockIdIntermediaryAccountConnectionAmino[];
}
export interface GenesisStateAminoMsg {
  type: "osmosis/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the module's genesis state. */
export interface GenesisStateSDKType {
  params: ParamsSDKType;
  superfluid_assets: SuperfluidAssetSDKType[];
  osmo_equivalent_multipliers: OsmoEquivalentMultiplierRecordSDKType[];
  intermediary_accounts: SuperfluidIntermediaryAccountSDKType[];
  intemediary_account_connections: LockIdIntermediaryAccountConnectionSDKType[];
}
function createBaseGenesisState(): GenesisState {
  return {
    params: Params.fromPartial({}),
    superfluidAssets: [],
    osmoEquivalentMultipliers: [],
    intermediaryAccounts: [],
    intemediaryAccountConnections: [],
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.superfluid.GenesisState",
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.superfluidAssets) {
      SuperfluidAsset.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.osmoEquivalentMultipliers) {
      OsmoEquivalentMultiplierRecord.encode(
        v!,
        writer.uint32(26).fork()
      ).ldelim();
    }
    for (const v of message.intermediaryAccounts) {
      SuperfluidIntermediaryAccount.encode(
        v!,
        writer.uint32(34).fork()
      ).ldelim();
    }
    for (const v of message.intemediaryAccountConnections) {
      LockIdIntermediaryAccountConnection.encode(
        v!,
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): GenesisState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.superfluidAssets.push(
            SuperfluidAsset.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.osmoEquivalentMultipliers.push(
            OsmoEquivalentMultiplierRecord.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.intermediaryAccounts.push(
            SuperfluidIntermediaryAccount.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.intemediaryAccountConnections.push(
            LockIdIntermediaryAccountConnection.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.superfluidAssets =
      object.superfluidAssets?.map((e) => SuperfluidAsset.fromPartial(e)) || [];
    message.osmoEquivalentMultipliers =
      object.osmoEquivalentMultipliers?.map((e) =>
        OsmoEquivalentMultiplierRecord.fromPartial(e)
      ) || [];
    message.intermediaryAccounts =
      object.intermediaryAccounts?.map((e) =>
        SuperfluidIntermediaryAccount.fromPartial(e)
      ) || [];
    message.intemediaryAccountConnections =
      object.intemediaryAccountConnections?.map((e) =>
        LockIdIntermediaryAccountConnection.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    const message = createBaseGenesisState();
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromAmino(object.params);
    }
    message.superfluidAssets =
      object.superfluid_assets?.map((e) => SuperfluidAsset.fromAmino(e)) || [];
    message.osmoEquivalentMultipliers =
      object.osmo_equivalent_multipliers?.map((e) =>
        OsmoEquivalentMultiplierRecord.fromAmino(e)
      ) || [];
    message.intermediaryAccounts =
      object.intermediary_accounts?.map((e) =>
        SuperfluidIntermediaryAccount.fromAmino(e)
      ) || [];
    message.intemediaryAccountConnections =
      object.intemediary_account_connections?.map((e) =>
        LockIdIntermediaryAccountConnection.fromAmino(e)
      ) || [];
    return message;
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    if (message.superfluidAssets) {
      obj.superfluid_assets = message.superfluidAssets.map((e) =>
        e ? SuperfluidAsset.toAmino(e) : undefined
      );
    } else {
      obj.superfluid_assets = message.superfluidAssets;
    }
    if (message.osmoEquivalentMultipliers) {
      obj.osmo_equivalent_multipliers = message.osmoEquivalentMultipliers.map(
        (e) => (e ? OsmoEquivalentMultiplierRecord.toAmino(e) : undefined)
      );
    } else {
      obj.osmo_equivalent_multipliers = message.osmoEquivalentMultipliers;
    }
    if (message.intermediaryAccounts) {
      obj.intermediary_accounts = message.intermediaryAccounts.map((e) =>
        e ? SuperfluidIntermediaryAccount.toAmino(e) : undefined
      );
    } else {
      obj.intermediary_accounts = message.intermediaryAccounts;
    }
    if (message.intemediaryAccountConnections) {
      obj.intemediary_account_connections =
        message.intemediaryAccountConnections.map((e) =>
          e ? LockIdIntermediaryAccountConnection.toAmino(e) : undefined
        );
    } else {
      obj.intemediary_account_connections =
        message.intemediaryAccountConnections;
    }
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/genesis-state",
      value: GenesisState.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
