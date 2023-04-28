import {
  Params,
  ParamsAmino,
  ParamsSDKType,
  Validator,
  ValidatorAmino,
  ValidatorSDKType,
  Delegation,
  DelegationAmino,
  DelegationSDKType,
  UnbondingDelegation,
  UnbondingDelegationAmino,
  UnbondingDelegationSDKType,
  Redelegation,
  RedelegationAmino,
  RedelegationSDKType,
} from "./staking";
import { Long } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** GenesisState defines the staking module's genesis state. */
export interface GenesisState {
  /** params defines all the paramaters of related to deposit. */
  params?: Params;
  /**
   * last_total_power tracks the total amounts of bonded tokens recorded during
   * the previous end block.
   */
  lastTotalPower: Uint8Array;
  /**
   * last_validator_powers is a special index that provides a historical list
   * of the last-block's bonded validators.
   */
  lastValidatorPowers: LastValidatorPower[];
  /** delegations defines the validator set at genesis. */
  validators: Validator[];
  /** delegations defines the delegations active at genesis. */
  delegations: Delegation[];
  /** unbonding_delegations defines the unbonding delegations active at genesis. */
  unbondingDelegations: UnbondingDelegation[];
  /** redelegations defines the redelegations active at genesis. */
  redelegations: Redelegation[];
  exported: boolean;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the staking module's genesis state. */
export interface GenesisStateAmino {
  /** params defines all the paramaters of related to deposit. */
  params?: ParamsAmino;
  /**
   * last_total_power tracks the total amounts of bonded tokens recorded during
   * the previous end block.
   */
  last_total_power: Uint8Array;
  /**
   * last_validator_powers is a special index that provides a historical list
   * of the last-block's bonded validators.
   */
  last_validator_powers: LastValidatorPowerAmino[];
  /** delegations defines the validator set at genesis. */
  validators: ValidatorAmino[];
  /** delegations defines the delegations active at genesis. */
  delegations: DelegationAmino[];
  /** unbonding_delegations defines the unbonding delegations active at genesis. */
  unbonding_delegations: UnbondingDelegationAmino[];
  /** redelegations defines the redelegations active at genesis. */
  redelegations: RedelegationAmino[];
  exported: boolean;
}
export interface GenesisStateAminoMsg {
  type: "cosmos-sdk/GenesisState";
  value: GenesisStateAmino;
}
/** GenesisState defines the staking module's genesis state. */
export interface GenesisStateSDKType {
  params?: ParamsSDKType;
  last_total_power: Uint8Array;
  last_validator_powers: LastValidatorPowerSDKType[];
  validators: ValidatorSDKType[];
  delegations: DelegationSDKType[];
  unbonding_delegations: UnbondingDelegationSDKType[];
  redelegations: RedelegationSDKType[];
  exported: boolean;
}
/** LastValidatorPower required for validator set update logic. */
export interface LastValidatorPower {
  /** address is the address of the validator. */
  address: string;
  /** power defines the power of the validator. */
  power: Long;
}
export interface LastValidatorPowerProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.LastValidatorPower";
  value: Uint8Array;
}
/** LastValidatorPower required for validator set update logic. */
export interface LastValidatorPowerAmino {
  /** address is the address of the validator. */
  address: string;
  /** power defines the power of the validator. */
  power: string;
}
export interface LastValidatorPowerAminoMsg {
  type: "cosmos-sdk/LastValidatorPower";
  value: LastValidatorPowerAmino;
}
/** LastValidatorPower required for validator set update logic. */
export interface LastValidatorPowerSDKType {
  address: string;
  power: Long;
}
function createBaseGenesisState(): GenesisState {
  return {
    params: undefined,
    lastTotalPower: new Uint8Array(),
    lastValidatorPowers: [],
    validators: [],
    delegations: [],
    unbondingDelegations: [],
    redelegations: [],
    exported: false,
  };
}
export const GenesisState = {
  typeUrl: "/cosmos.staking.v1beta1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    if (message.lastTotalPower.length !== 0) {
      writer.uint32(18).bytes(message.lastTotalPower);
    }
    for (const v of message.lastValidatorPowers) {
      LastValidatorPower.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.delegations) {
      Delegation.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.unbondingDelegations) {
      UnbondingDelegation.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.redelegations) {
      Redelegation.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (message.exported === true) {
      writer.uint32(64).bool(message.exported);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.lastTotalPower = reader.bytes();
          break;
        case 3:
          message.lastValidatorPowers.push(
            LastValidatorPower.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.validators.push(Validator.decode(reader, reader.uint32()));
          break;
        case 5:
          message.delegations.push(Delegation.decode(reader, reader.uint32()));
          break;
        case 6:
          message.unbondingDelegations.push(
            UnbondingDelegation.decode(reader, reader.uint32())
          );
          break;
        case 7:
          message.redelegations.push(
            Redelegation.decode(reader, reader.uint32())
          );
          break;
        case 8:
          message.exported = reader.bool();
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
    message.lastTotalPower = object.lastTotalPower ?? new Uint8Array();
    message.lastValidatorPowers =
      object.lastValidatorPowers?.map((e) =>
        LastValidatorPower.fromPartial(e)
      ) || [];
    message.validators =
      object.validators?.map((e) => Validator.fromPartial(e)) || [];
    message.delegations =
      object.delegations?.map((e) => Delegation.fromPartial(e)) || [];
    message.unbondingDelegations =
      object.unbondingDelegations?.map((e) =>
        UnbondingDelegation.fromPartial(e)
      ) || [];
    message.redelegations =
      object.redelegations?.map((e) => Redelegation.fromPartial(e)) || [];
    message.exported = object.exported ?? false;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
      lastTotalPower: object.last_total_power,
      lastValidatorPowers: Array.isArray(object?.last_validator_powers)
        ? object.last_validator_powers.map((e: any) =>
            LastValidatorPower.fromAmino(e)
          )
        : [],
      validators: Array.isArray(object?.validators)
        ? object.validators.map((e: any) => Validator.fromAmino(e))
        : [],
      delegations: Array.isArray(object?.delegations)
        ? object.delegations.map((e: any) => Delegation.fromAmino(e))
        : [],
      unbondingDelegations: Array.isArray(object?.unbonding_delegations)
        ? object.unbonding_delegations.map((e: any) =>
            UnbondingDelegation.fromAmino(e)
          )
        : [],
      redelegations: Array.isArray(object?.redelegations)
        ? object.redelegations.map((e: any) => Redelegation.fromAmino(e))
        : [],
      exported: object.exported,
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    obj.last_total_power = message.lastTotalPower;
    if (message.lastValidatorPowers) {
      obj.last_validator_powers = message.lastValidatorPowers.map((e) =>
        e ? LastValidatorPower.toAmino(e) : undefined
      );
    } else {
      obj.last_validator_powers = [];
    }
    if (message.validators) {
      obj.validators = message.validators.map((e) =>
        e ? Validator.toAmino(e) : undefined
      );
    } else {
      obj.validators = [];
    }
    if (message.delegations) {
      obj.delegations = message.delegations.map((e) =>
        e ? Delegation.toAmino(e) : undefined
      );
    } else {
      obj.delegations = [];
    }
    if (message.unbondingDelegations) {
      obj.unbonding_delegations = message.unbondingDelegations.map((e) =>
        e ? UnbondingDelegation.toAmino(e) : undefined
      );
    } else {
      obj.unbonding_delegations = [];
    }
    if (message.redelegations) {
      obj.redelegations = message.redelegations.map((e) =>
        e ? Redelegation.toAmino(e) : undefined
      );
    } else {
      obj.redelegations = [];
    }
    obj.exported = message.exported;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "cosmos-sdk/GenesisState",
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
      typeUrl: "/cosmos.staking.v1beta1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
function createBaseLastValidatorPower(): LastValidatorPower {
  return {
    address: "",
    power: Long.ZERO,
  };
}
export const LastValidatorPower = {
  typeUrl: "/cosmos.staking.v1beta1.LastValidatorPower",
  encode(
    message: LastValidatorPower,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (!message.power.isZero()) {
      writer.uint32(16).int64(message.power);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): LastValidatorPower {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLastValidatorPower();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.power = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<LastValidatorPower>): LastValidatorPower {
    const message = createBaseLastValidatorPower();
    message.address = object.address ?? "";
    message.power =
      object.power !== undefined && object.power !== null
        ? Long.fromValue(object.power)
        : Long.ZERO;
    return message;
  },
  fromAmino(object: LastValidatorPowerAmino): LastValidatorPower {
    return {
      address: object.address,
      power: Long.fromString(object.power),
    };
  },
  toAmino(message: LastValidatorPower): LastValidatorPowerAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.power = message.power ? message.power.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: LastValidatorPowerAminoMsg): LastValidatorPower {
    return LastValidatorPower.fromAmino(object.value);
  },
  toAminoMsg(message: LastValidatorPower): LastValidatorPowerAminoMsg {
    return {
      type: "cosmos-sdk/LastValidatorPower",
      value: LastValidatorPower.toAmino(message),
    };
  },
  fromProtoMsg(message: LastValidatorPowerProtoMsg): LastValidatorPower {
    return LastValidatorPower.decode(message.value);
  },
  toProto(message: LastValidatorPower): Uint8Array {
    return LastValidatorPower.encode(message).finish();
  },
  toProtoMsg(message: LastValidatorPower): LastValidatorPowerProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.LastValidatorPower",
      value: LastValidatorPower.encode(message).finish(),
    };
  },
};
