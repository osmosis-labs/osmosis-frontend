//@ts-nocheck
import { decodeBech32Pubkey, encodeBech32Pubkey } from "@cosmjs/amino";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  Any,
  AnyAmino,
  AnyProtoMsg,
  AnySDKType,
} from "../../../google/protobuf/any";
import {
  Duration,
  DurationAmino,
  DurationSDKType,
} from "../../../google/protobuf/duration";
import { Timestamp } from "../../../google/protobuf/timestamp";
import { fromTimestamp, isSet, toTimestamp } from "../../../helpers";
import {
  Header,
  HeaderAmino,
  HeaderSDKType,
} from "../../../tendermint/types/types";
import { Coin, CoinAmino, CoinSDKType } from "../../base/v1beta1/coin";
/** BondStatus is the status of a validator. */
export enum BondStatus {
  /** BOND_STATUS_UNSPECIFIED - UNSPECIFIED defines an invalid validator status. */
  BOND_STATUS_UNSPECIFIED = 0,
  /** BOND_STATUS_UNBONDED - UNBONDED defines a validator that is not bonded. */
  BOND_STATUS_UNBONDED = 1,
  /** BOND_STATUS_UNBONDING - UNBONDING defines a validator that is unbonding. */
  BOND_STATUS_UNBONDING = 2,
  /** BOND_STATUS_BONDED - BONDED defines a validator that is bonded. */
  BOND_STATUS_BONDED = 3,
  UNRECOGNIZED = -1,
}
export const BondStatusSDKType = BondStatus;
export const BondStatusAmino = BondStatus;
export function bondStatusFromJSON(object: any): BondStatus {
  switch (object) {
    case 0:
    case "BOND_STATUS_UNSPECIFIED":
      return BondStatus.BOND_STATUS_UNSPECIFIED;
    case 1:
    case "BOND_STATUS_UNBONDED":
      return BondStatus.BOND_STATUS_UNBONDED;
    case 2:
    case "BOND_STATUS_UNBONDING":
      return BondStatus.BOND_STATUS_UNBONDING;
    case 3:
    case "BOND_STATUS_BONDED":
      return BondStatus.BOND_STATUS_BONDED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return BondStatus.UNRECOGNIZED;
  }
}
export function bondStatusToJSON(object: BondStatus): string {
  switch (object) {
    case BondStatus.BOND_STATUS_UNSPECIFIED:
      return "BOND_STATUS_UNSPECIFIED";
    case BondStatus.BOND_STATUS_UNBONDED:
      return "BOND_STATUS_UNBONDED";
    case BondStatus.BOND_STATUS_UNBONDING:
      return "BOND_STATUS_UNBONDING";
    case BondStatus.BOND_STATUS_BONDED:
      return "BOND_STATUS_BONDED";
    case BondStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
/**
 * HistoricalInfo contains header and validator information for a given block.
 * It is stored as part of staking module's state, which persists the `n` most
 * recent HistoricalInfo
 * (`n` is set by the staking module's `historical_entries` parameter).
 */
export interface HistoricalInfo {
  header: Header;
  valset: Validator[];
}
export interface HistoricalInfoProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.HistoricalInfo";
  value: Uint8Array;
}
/**
 * HistoricalInfo contains header and validator information for a given block.
 * It is stored as part of staking module's state, which persists the `n` most
 * recent HistoricalInfo
 * (`n` is set by the staking module's `historical_entries` parameter).
 */
export interface HistoricalInfoAmino {
  header?: HeaderAmino;
  valset: ValidatorAmino[];
}
export interface HistoricalInfoAminoMsg {
  type: "cosmos-sdk/HistoricalInfo";
  value: HistoricalInfoAmino;
}
/**
 * HistoricalInfo contains header and validator information for a given block.
 * It is stored as part of staking module's state, which persists the `n` most
 * recent HistoricalInfo
 * (`n` is set by the staking module's `historical_entries` parameter).
 */
export interface HistoricalInfoSDKType {
  header: HeaderSDKType;
  valset: ValidatorSDKType[];
}
/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRates {
  /** rate is the commission rate charged to delegators, as a fraction. */
  rate: string;
  /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
  maxRate: string;
  /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
  maxChangeRate: string;
}
export interface CommissionRatesProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.CommissionRates";
  value: Uint8Array;
}
/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRatesAmino {
  /** rate is the commission rate charged to delegators, as a fraction. */
  rate: string;
  /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
  max_rate: string;
  /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
  max_change_rate: string;
}
export interface CommissionRatesAminoMsg {
  type: "cosmos-sdk/CommissionRates";
  value: CommissionRatesAmino;
}
/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRatesSDKType {
  rate: string;
  max_rate: string;
  max_change_rate: string;
}
/** Commission defines commission parameters for a given validator. */
export interface Commission {
  /** commission_rates defines the initial commission rates to be used for creating a validator. */
  commissionRates: CommissionRates;
  /** update_time is the last time the commission rate was changed. */
  updateTime: Date;
}
export interface CommissionProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.Commission";
  value: Uint8Array;
}
/** Commission defines commission parameters for a given validator. */
export interface CommissionAmino {
  /** commission_rates defines the initial commission rates to be used for creating a validator. */
  commission_rates?: CommissionRatesAmino;
  /** update_time is the last time the commission rate was changed. */
  update_time?: Date;
}
export interface CommissionAminoMsg {
  type: "cosmos-sdk/Commission";
  value: CommissionAmino;
}
/** Commission defines commission parameters for a given validator. */
export interface CommissionSDKType {
  commission_rates: CommissionRatesSDKType;
  update_time: Date;
}
/** Description defines a validator description. */
export interface Description {
  /** moniker defines a human-readable name for the validator. */
  moniker: string;
  /** identity defines an optional identity signature (ex. UPort or Keybase). */
  identity: string;
  /** website defines an optional website link. */
  website: string;
  /** security_contact defines an optional email for security contact. */
  securityContact: string;
  /** details define other optional details. */
  details: string;
}
export interface DescriptionProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.Description";
  value: Uint8Array;
}
/** Description defines a validator description. */
export interface DescriptionAmino {
  /** moniker defines a human-readable name for the validator. */
  moniker: string;
  /** identity defines an optional identity signature (ex. UPort or Keybase). */
  identity: string;
  /** website defines an optional website link. */
  website: string;
  /** security_contact defines an optional email for security contact. */
  security_contact: string;
  /** details define other optional details. */
  details: string;
}
export interface DescriptionAminoMsg {
  type: "cosmos-sdk/Description";
  value: DescriptionAmino;
}
/** Description defines a validator description. */
export interface DescriptionSDKType {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}
/**
 * Validator defines a validator, together with the total amount of the
 * Validator's bond shares and their exchange rate to coins. Slashing results in
 * a decrease in the exchange rate, allowing correct calculation of future
 * undelegations without iterating over delegators. When coins are delegated to
 * this validator, the validator is credited with a delegation whose number of
 * bond shares is based on the amount of coins delegated divided by the current
 * exchange rate. Voting power can be calculated as total bonded shares
 * multiplied by exchange rate.
 */
export interface Validator {
  /** operator_address defines the address of the validator's operator; bech encoded in JSON. */
  operatorAddress: string;
  /** consensus_pubkey is the consensus public key of the validator, as a Protobuf Any. */
  consensusPubkey: Any | undefined;
  /** jailed defined whether the validator has been jailed from bonded status or not. */
  jailed: boolean;
  /** status is the validator status (bonded/unbonding/unbonded). */
  status: BondStatus;
  /** tokens define the delegated tokens (incl. self-delegation). */
  tokens: string;
  /** delegator_shares defines total shares issued to a validator's delegators. */
  delegatorShares: string;
  /** description defines the description terms for the validator. */
  description: Description;
  /** unbonding_height defines, if unbonding, the height at which this validator has begun unbonding. */
  unbondingHeight: bigint;
  /** unbonding_time defines, if unbonding, the min time for the validator to complete unbonding. */
  unbondingTime: Date;
  /** commission defines the commission parameters. */
  commission: Commission;
  /** min_self_delegation is the validator's self declared minimum self delegation. */
  minSelfDelegation: string;
}
export interface ValidatorProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.Validator";
  value: Uint8Array;
}
export type ValidatorEncoded = Omit<Validator, "consensusPubkey"> & {
  /** consensus_pubkey is the consensus public key of the validator, as a Protobuf Any. */ consensusPubkey?:
    | AnyProtoMsg
    | undefined;
};
/**
 * Validator defines a validator, together with the total amount of the
 * Validator's bond shares and their exchange rate to coins. Slashing results in
 * a decrease in the exchange rate, allowing correct calculation of future
 * undelegations without iterating over delegators. When coins are delegated to
 * this validator, the validator is credited with a delegation whose number of
 * bond shares is based on the amount of coins delegated divided by the current
 * exchange rate. Voting power can be calculated as total bonded shares
 * multiplied by exchange rate.
 */
export interface ValidatorAmino {
  /** operator_address defines the address of the validator's operator; bech encoded in JSON. */
  operator_address: string;
  /** consensus_pubkey is the consensus public key of the validator, as a Protobuf Any. */
  consensus_pubkey?: AnyAmino;
  /** jailed defined whether the validator has been jailed from bonded status or not. */
  jailed: boolean;
  /** status is the validator status (bonded/unbonding/unbonded). */
  status: BondStatus;
  /** tokens define the delegated tokens (incl. self-delegation). */
  tokens: string;
  /** delegator_shares defines total shares issued to a validator's delegators. */
  delegator_shares: string;
  /** description defines the description terms for the validator. */
  description?: DescriptionAmino;
  /** unbonding_height defines, if unbonding, the height at which this validator has begun unbonding. */
  unbonding_height: string;
  /** unbonding_time defines, if unbonding, the min time for the validator to complete unbonding. */
  unbonding_time?: Date;
  /** commission defines the commission parameters. */
  commission?: CommissionAmino;
  /** min_self_delegation is the validator's self declared minimum self delegation. */
  min_self_delegation: string;
}
export interface ValidatorAminoMsg {
  type: "cosmos-sdk/Validator";
  value: ValidatorAmino;
}
/**
 * Validator defines a validator, together with the total amount of the
 * Validator's bond shares and their exchange rate to coins. Slashing results in
 * a decrease in the exchange rate, allowing correct calculation of future
 * undelegations without iterating over delegators. When coins are delegated to
 * this validator, the validator is credited with a delegation whose number of
 * bond shares is based on the amount of coins delegated divided by the current
 * exchange rate. Voting power can be calculated as total bonded shares
 * multiplied by exchange rate.
 */
export interface ValidatorSDKType {
  operator_address: string;
  consensus_pubkey: AnySDKType | undefined;
  jailed: boolean;
  status: BondStatus;
  tokens: string;
  delegator_shares: string;
  description: DescriptionSDKType;
  unbonding_height: bigint;
  unbonding_time: Date;
  commission: CommissionSDKType;
  min_self_delegation: string;
}
/** ValAddresses defines a repeated set of validator addresses. */
export interface ValAddresses {
  addresses: string[];
}
export interface ValAddressesProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.ValAddresses";
  value: Uint8Array;
}
/** ValAddresses defines a repeated set of validator addresses. */
export interface ValAddressesAmino {
  addresses: string[];
}
export interface ValAddressesAminoMsg {
  type: "cosmos-sdk/ValAddresses";
  value: ValAddressesAmino;
}
/** ValAddresses defines a repeated set of validator addresses. */
export interface ValAddressesSDKType {
  addresses: string[];
}
/**
 * DVPair is struct that just has a delegator-validator pair with no other data.
 * It is intended to be used as a marshalable pointer. For example, a DVPair can
 * be used to construct the key to getting an UnbondingDelegation from state.
 */
export interface DVPair {
  delegatorAddress: string;
  validatorAddress: string;
}
export interface DVPairProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.DVPair";
  value: Uint8Array;
}
/**
 * DVPair is struct that just has a delegator-validator pair with no other data.
 * It is intended to be used as a marshalable pointer. For example, a DVPair can
 * be used to construct the key to getting an UnbondingDelegation from state.
 */
export interface DVPairAmino {
  delegator_address: string;
  validator_address: string;
}
export interface DVPairAminoMsg {
  type: "cosmos-sdk/DVPair";
  value: DVPairAmino;
}
/**
 * DVPair is struct that just has a delegator-validator pair with no other data.
 * It is intended to be used as a marshalable pointer. For example, a DVPair can
 * be used to construct the key to getting an UnbondingDelegation from state.
 */
export interface DVPairSDKType {
  delegator_address: string;
  validator_address: string;
}
/** DVPairs defines an array of DVPair objects. */
export interface DVPairs {
  pairs: DVPair[];
}
export interface DVPairsProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.DVPairs";
  value: Uint8Array;
}
/** DVPairs defines an array of DVPair objects. */
export interface DVPairsAmino {
  pairs: DVPairAmino[];
}
export interface DVPairsAminoMsg {
  type: "cosmos-sdk/DVPairs";
  value: DVPairsAmino;
}
/** DVPairs defines an array of DVPair objects. */
export interface DVPairsSDKType {
  pairs: DVPairSDKType[];
}
/**
 * DVVTriplet is struct that just has a delegator-validator-validator triplet
 * with no other data. It is intended to be used as a marshalable pointer. For
 * example, a DVVTriplet can be used to construct the key to getting a
 * Redelegation from state.
 */
export interface DVVTriplet {
  delegatorAddress: string;
  validatorSrcAddress: string;
  validatorDstAddress: string;
}
export interface DVVTripletProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.DVVTriplet";
  value: Uint8Array;
}
/**
 * DVVTriplet is struct that just has a delegator-validator-validator triplet
 * with no other data. It is intended to be used as a marshalable pointer. For
 * example, a DVVTriplet can be used to construct the key to getting a
 * Redelegation from state.
 */
export interface DVVTripletAmino {
  delegator_address: string;
  validator_src_address: string;
  validator_dst_address: string;
}
export interface DVVTripletAminoMsg {
  type: "cosmos-sdk/DVVTriplet";
  value: DVVTripletAmino;
}
/**
 * DVVTriplet is struct that just has a delegator-validator-validator triplet
 * with no other data. It is intended to be used as a marshalable pointer. For
 * example, a DVVTriplet can be used to construct the key to getting a
 * Redelegation from state.
 */
export interface DVVTripletSDKType {
  delegator_address: string;
  validator_src_address: string;
  validator_dst_address: string;
}
/** DVVTriplets defines an array of DVVTriplet objects. */
export interface DVVTriplets {
  triplets: DVVTriplet[];
}
export interface DVVTripletsProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.DVVTriplets";
  value: Uint8Array;
}
/** DVVTriplets defines an array of DVVTriplet objects. */
export interface DVVTripletsAmino {
  triplets: DVVTripletAmino[];
}
export interface DVVTripletsAminoMsg {
  type: "cosmos-sdk/DVVTriplets";
  value: DVVTripletsAmino;
}
/** DVVTriplets defines an array of DVVTriplet objects. */
export interface DVVTripletsSDKType {
  triplets: DVVTripletSDKType[];
}
/**
 * Delegation represents the bond with tokens held by an account. It is
 * owned by one delegator, and is associated with the voting power of one
 * validator.
 */
export interface Delegation {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegatorAddress: string;
  /** validator_address is the bech32-encoded address of the validator. */
  validatorAddress: string;
  /** shares define the delegation shares received. */
  shares: string;
}
export interface DelegationProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.Delegation";
  value: Uint8Array;
}
/**
 * Delegation represents the bond with tokens held by an account. It is
 * owned by one delegator, and is associated with the voting power of one
 * validator.
 */
export interface DelegationAmino {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegator_address: string;
  /** validator_address is the bech32-encoded address of the validator. */
  validator_address: string;
  /** shares define the delegation shares received. */
  shares: string;
}
export interface DelegationAminoMsg {
  type: "cosmos-sdk/Delegation";
  value: DelegationAmino;
}
/**
 * Delegation represents the bond with tokens held by an account. It is
 * owned by one delegator, and is associated with the voting power of one
 * validator.
 */
export interface DelegationSDKType {
  delegator_address: string;
  validator_address: string;
  shares: string;
}
/**
 * UnbondingDelegation stores all of a single delegator's unbonding bonds
 * for a single validator in an time-ordered list.
 */
export interface UnbondingDelegation {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegatorAddress: string;
  /** validator_address is the bech32-encoded address of the validator. */
  validatorAddress: string;
  /** entries are the unbonding delegation entries. */
  entries: UnbondingDelegationEntry[];
}
export interface UnbondingDelegationProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.UnbondingDelegation";
  value: Uint8Array;
}
/**
 * UnbondingDelegation stores all of a single delegator's unbonding bonds
 * for a single validator in an time-ordered list.
 */
export interface UnbondingDelegationAmino {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegator_address: string;
  /** validator_address is the bech32-encoded address of the validator. */
  validator_address: string;
  /** entries are the unbonding delegation entries. */
  entries: UnbondingDelegationEntryAmino[];
}
export interface UnbondingDelegationAminoMsg {
  type: "cosmos-sdk/UnbondingDelegation";
  value: UnbondingDelegationAmino;
}
/**
 * UnbondingDelegation stores all of a single delegator's unbonding bonds
 * for a single validator in an time-ordered list.
 */
export interface UnbondingDelegationSDKType {
  delegator_address: string;
  validator_address: string;
  entries: UnbondingDelegationEntrySDKType[];
}
/** UnbondingDelegationEntry defines an unbonding object with relevant metadata. */
export interface UnbondingDelegationEntry {
  /** creation_height is the height which the unbonding took place. */
  creationHeight: bigint;
  /** completion_time is the unix time for unbonding completion. */
  completionTime: Date;
  /** initial_balance defines the tokens initially scheduled to receive at completion. */
  initialBalance: string;
  /** balance defines the tokens to receive at completion. */
  balance: string;
}
export interface UnbondingDelegationEntryProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.UnbondingDelegationEntry";
  value: Uint8Array;
}
/** UnbondingDelegationEntry defines an unbonding object with relevant metadata. */
export interface UnbondingDelegationEntryAmino {
  /** creation_height is the height which the unbonding took place. */
  creation_height: string;
  /** completion_time is the unix time for unbonding completion. */
  completion_time?: Date;
  /** initial_balance defines the tokens initially scheduled to receive at completion. */
  initial_balance: string;
  /** balance defines the tokens to receive at completion. */
  balance: string;
}
export interface UnbondingDelegationEntryAminoMsg {
  type: "cosmos-sdk/UnbondingDelegationEntry";
  value: UnbondingDelegationEntryAmino;
}
/** UnbondingDelegationEntry defines an unbonding object with relevant metadata. */
export interface UnbondingDelegationEntrySDKType {
  creation_height: bigint;
  completion_time: Date;
  initial_balance: string;
  balance: string;
}
/** RedelegationEntry defines a redelegation object with relevant metadata. */
export interface RedelegationEntry {
  /** creation_height  defines the height which the redelegation took place. */
  creationHeight: bigint;
  /** completion_time defines the unix time for redelegation completion. */
  completionTime: Date;
  /** initial_balance defines the initial balance when redelegation started. */
  initialBalance: string;
  /** shares_dst is the amount of destination-validator shares created by redelegation. */
  sharesDst: string;
}
export interface RedelegationEntryProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.RedelegationEntry";
  value: Uint8Array;
}
/** RedelegationEntry defines a redelegation object with relevant metadata. */
export interface RedelegationEntryAmino {
  /** creation_height  defines the height which the redelegation took place. */
  creation_height: string;
  /** completion_time defines the unix time for redelegation completion. */
  completion_time?: Date;
  /** initial_balance defines the initial balance when redelegation started. */
  initial_balance: string;
  /** shares_dst is the amount of destination-validator shares created by redelegation. */
  shares_dst: string;
}
export interface RedelegationEntryAminoMsg {
  type: "cosmos-sdk/RedelegationEntry";
  value: RedelegationEntryAmino;
}
/** RedelegationEntry defines a redelegation object with relevant metadata. */
export interface RedelegationEntrySDKType {
  creation_height: bigint;
  completion_time: Date;
  initial_balance: string;
  shares_dst: string;
}
/**
 * Redelegation contains the list of a particular delegator's redelegating bonds
 * from a particular source validator to a particular destination validator.
 */
export interface Redelegation {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegatorAddress: string;
  /** validator_src_address is the validator redelegation source operator address. */
  validatorSrcAddress: string;
  /** validator_dst_address is the validator redelegation destination operator address. */
  validatorDstAddress: string;
  /** entries are the redelegation entries. */
  entries: RedelegationEntry[];
}
export interface RedelegationProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.Redelegation";
  value: Uint8Array;
}
/**
 * Redelegation contains the list of a particular delegator's redelegating bonds
 * from a particular source validator to a particular destination validator.
 */
export interface RedelegationAmino {
  /** delegator_address is the bech32-encoded address of the delegator. */
  delegator_address: string;
  /** validator_src_address is the validator redelegation source operator address. */
  validator_src_address: string;
  /** validator_dst_address is the validator redelegation destination operator address. */
  validator_dst_address: string;
  /** entries are the redelegation entries. */
  entries: RedelegationEntryAmino[];
}
export interface RedelegationAminoMsg {
  type: "cosmos-sdk/Redelegation";
  value: RedelegationAmino;
}
/**
 * Redelegation contains the list of a particular delegator's redelegating bonds
 * from a particular source validator to a particular destination validator.
 */
export interface RedelegationSDKType {
  delegator_address: string;
  validator_src_address: string;
  validator_dst_address: string;
  entries: RedelegationEntrySDKType[];
}
/** Params defines the parameters for the staking module. */
export interface Params {
  /** unbonding_time is the time duration of unbonding. */
  unbondingTime: Duration;
  /** max_validators is the maximum number of validators. */
  maxValidators: number;
  /** max_entries is the max entries for either unbonding delegation or redelegation (per pair/trio). */
  maxEntries: number;
  /** historical_entries is the number of historical entries to persist. */
  historicalEntries: number;
  /** bond_denom defines the bondable coin denomination. */
  bondDenom: string;
  /** min_commission_rate is the chain-wide minimum commission rate that a validator can charge their delegators */
  minCommissionRate: string;
}
export interface ParamsProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.Params";
  value: Uint8Array;
}
/** Params defines the parameters for the staking module. */
export interface ParamsAmino {
  /** unbonding_time is the time duration of unbonding. */
  unbonding_time?: DurationAmino;
  /** max_validators is the maximum number of validators. */
  max_validators: number;
  /** max_entries is the max entries for either unbonding delegation or redelegation (per pair/trio). */
  max_entries: number;
  /** historical_entries is the number of historical entries to persist. */
  historical_entries: number;
  /** bond_denom defines the bondable coin denomination. */
  bond_denom: string;
  /** min_commission_rate is the chain-wide minimum commission rate that a validator can charge their delegators */
  min_commission_rate: string;
}
export interface ParamsAminoMsg {
  type: "cosmos-sdk/Params";
  value: ParamsAmino;
}
/** Params defines the parameters for the staking module. */
export interface ParamsSDKType {
  unbonding_time: DurationSDKType;
  max_validators: number;
  max_entries: number;
  historical_entries: number;
  bond_denom: string;
  min_commission_rate: string;
}
/**
 * DelegationResponse is equivalent to Delegation except that it contains a
 * balance in addition to shares which is more suitable for client responses.
 */
export interface DelegationResponse {
  delegation: Delegation;
  balance: Coin;
}
export interface DelegationResponseProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.DelegationResponse";
  value: Uint8Array;
}
/**
 * DelegationResponse is equivalent to Delegation except that it contains a
 * balance in addition to shares which is more suitable for client responses.
 */
export interface DelegationResponseAmino {
  delegation?: DelegationAmino;
  balance?: CoinAmino;
}
export interface DelegationResponseAminoMsg {
  type: "cosmos-sdk/DelegationResponse";
  value: DelegationResponseAmino;
}
/**
 * DelegationResponse is equivalent to Delegation except that it contains a
 * balance in addition to shares which is more suitable for client responses.
 */
export interface DelegationResponseSDKType {
  delegation: DelegationSDKType;
  balance: CoinSDKType;
}
/**
 * RedelegationEntryResponse is equivalent to a RedelegationEntry except that it
 * contains a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationEntryResponse {
  redelegationEntry: RedelegationEntry;
  balance: string;
}
export interface RedelegationEntryResponseProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.RedelegationEntryResponse";
  value: Uint8Array;
}
/**
 * RedelegationEntryResponse is equivalent to a RedelegationEntry except that it
 * contains a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationEntryResponseAmino {
  redelegation_entry?: RedelegationEntryAmino;
  balance: string;
}
export interface RedelegationEntryResponseAminoMsg {
  type: "cosmos-sdk/RedelegationEntryResponse";
  value: RedelegationEntryResponseAmino;
}
/**
 * RedelegationEntryResponse is equivalent to a RedelegationEntry except that it
 * contains a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationEntryResponseSDKType {
  redelegation_entry: RedelegationEntrySDKType;
  balance: string;
}
/**
 * RedelegationResponse is equivalent to a Redelegation except that its entries
 * contain a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationResponse {
  redelegation: Redelegation;
  entries: RedelegationEntryResponse[];
}
export interface RedelegationResponseProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.RedelegationResponse";
  value: Uint8Array;
}
/**
 * RedelegationResponse is equivalent to a Redelegation except that its entries
 * contain a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationResponseAmino {
  redelegation?: RedelegationAmino;
  entries: RedelegationEntryResponseAmino[];
}
export interface RedelegationResponseAminoMsg {
  type: "cosmos-sdk/RedelegationResponse";
  value: RedelegationResponseAmino;
}
/**
 * RedelegationResponse is equivalent to a Redelegation except that its entries
 * contain a balance in addition to shares which is more suitable for client
 * responses.
 */
export interface RedelegationResponseSDKType {
  redelegation: RedelegationSDKType;
  entries: RedelegationEntryResponseSDKType[];
}
/**
 * Pool is used for tracking bonded and not-bonded token supply of the bond
 * denomination.
 */
export interface Pool {
  notBondedTokens: string;
  bondedTokens: string;
}
export interface PoolProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.Pool";
  value: Uint8Array;
}
/**
 * Pool is used for tracking bonded and not-bonded token supply of the bond
 * denomination.
 */
export interface PoolAmino {
  not_bonded_tokens: string;
  bonded_tokens: string;
}
export interface PoolAminoMsg {
  type: "cosmos-sdk/Pool";
  value: PoolAmino;
}
/**
 * Pool is used for tracking bonded and not-bonded token supply of the bond
 * denomination.
 */
export interface PoolSDKType {
  not_bonded_tokens: string;
  bonded_tokens: string;
}
function createBaseHistoricalInfo(): HistoricalInfo {
  return {
    header: Header.fromPartial({}),
    valset: [],
  };
}
export const HistoricalInfo = {
  typeUrl: "/cosmos.staking.v1beta1.HistoricalInfo",
  encode(
    message: HistoricalInfo,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.valset) {
      Validator.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): HistoricalInfo {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHistoricalInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 2:
          message.valset.push(Validator.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<HistoricalInfo>): HistoricalInfo {
    const message = createBaseHistoricalInfo();
    message.header =
      object.header !== undefined && object.header !== null
        ? Header.fromPartial(object.header)
        : undefined;
    message.valset = object.valset?.map((e) => Validator.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: HistoricalInfoAmino): HistoricalInfo {
    return {
      header: object?.header ? Header.fromAmino(object.header) : undefined,
      valset: Array.isArray(object?.valset)
        ? object.valset.map((e: any) => Validator.fromAmino(e))
        : [],
    };
  },
  toAmino(message: HistoricalInfo): HistoricalInfoAmino {
    const obj: any = {};
    obj.header = message.header ? Header.toAmino(message.header) : undefined;
    if (message.valset) {
      obj.valset = message.valset.map((e) =>
        e ? Validator.toAmino(e) : undefined
      );
    } else {
      obj.valset = [];
    }
    return obj;
  },
  fromAminoMsg(object: HistoricalInfoAminoMsg): HistoricalInfo {
    return HistoricalInfo.fromAmino(object.value);
  },
  toAminoMsg(message: HistoricalInfo): HistoricalInfoAminoMsg {
    return {
      type: "cosmos-sdk/HistoricalInfo",
      value: HistoricalInfo.toAmino(message),
    };
  },
  fromProtoMsg(message: HistoricalInfoProtoMsg): HistoricalInfo {
    return HistoricalInfo.decode(message.value);
  },
  toProto(message: HistoricalInfo): Uint8Array {
    return HistoricalInfo.encode(message).finish();
  },
  toProtoMsg(message: HistoricalInfo): HistoricalInfoProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.HistoricalInfo",
      value: HistoricalInfo.encode(message).finish(),
    };
  },
};
function createBaseCommissionRates(): CommissionRates {
  return {
    rate: "",
    maxRate: "",
    maxChangeRate: "",
  };
}
export const CommissionRates = {
  typeUrl: "/cosmos.staking.v1beta1.CommissionRates",
  encode(
    message: CommissionRates,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.rate !== "") {
      writer.uint32(10).string(Decimal.fromUserInput(message.rate, 18).atomics);
    }
    if (message.maxRate !== "") {
      writer
        .uint32(18)
        .string(Decimal.fromUserInput(message.maxRate, 18).atomics);
    }
    if (message.maxChangeRate !== "") {
      writer
        .uint32(26)
        .string(Decimal.fromUserInput(message.maxChangeRate, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CommissionRates {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommissionRates();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 2:
          message.maxRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.maxChangeRate = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CommissionRates>): CommissionRates {
    const message = createBaseCommissionRates();
    message.rate = object.rate ?? "";
    message.maxRate = object.maxRate ?? "";
    message.maxChangeRate = object.maxChangeRate ?? "";
    return message;
  },
  fromAmino(object: CommissionRatesAmino): CommissionRates {
    return {
      rate: object.rate,
      maxRate: object.max_rate,
      maxChangeRate: object.max_change_rate,
    };
  },
  toAmino(message: CommissionRates): CommissionRatesAmino {
    const obj: any = {};
    obj.rate = message.rate;
    obj.max_rate = message.maxRate;
    obj.max_change_rate = message.maxChangeRate;
    return obj;
  },
  fromAminoMsg(object: CommissionRatesAminoMsg): CommissionRates {
    return CommissionRates.fromAmino(object.value);
  },
  toAminoMsg(message: CommissionRates): CommissionRatesAminoMsg {
    return {
      type: "cosmos-sdk/CommissionRates",
      value: CommissionRates.toAmino(message),
    };
  },
  fromProtoMsg(message: CommissionRatesProtoMsg): CommissionRates {
    return CommissionRates.decode(message.value);
  },
  toProto(message: CommissionRates): Uint8Array {
    return CommissionRates.encode(message).finish();
  },
  toProtoMsg(message: CommissionRates): CommissionRatesProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.CommissionRates",
      value: CommissionRates.encode(message).finish(),
    };
  },
};
function createBaseCommission(): Commission {
  return {
    commissionRates: CommissionRates.fromPartial({}),
    updateTime: undefined,
  };
}
export const Commission = {
  typeUrl: "/cosmos.staking.v1beta1.Commission",
  encode(
    message: Commission,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.commissionRates !== undefined) {
      CommissionRates.encode(
        message.commissionRates,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.updateTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.updateTime),
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Commission {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommission();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.commissionRates = CommissionRates.decode(
            reader,
            reader.uint32()
          );
          break;
        case 2:
          message.updateTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Commission>): Commission {
    const message = createBaseCommission();
    message.commissionRates =
      object.commissionRates !== undefined && object.commissionRates !== null
        ? CommissionRates.fromPartial(object.commissionRates)
        : undefined;
    message.updateTime = object.updateTime ?? undefined;
    return message;
  },
  fromAmino(object: CommissionAmino): Commission {
    return {
      commissionRates: object?.commission_rates
        ? CommissionRates.fromAmino(object.commission_rates)
        : undefined,
      updateTime: object.update_time,
    };
  },
  toAmino(message: Commission): CommissionAmino {
    const obj: any = {};
    obj.commission_rates = message.commissionRates
      ? CommissionRates.toAmino(message.commissionRates)
      : undefined;
    obj.update_time = message.updateTime;
    return obj;
  },
  fromAminoMsg(object: CommissionAminoMsg): Commission {
    return Commission.fromAmino(object.value);
  },
  toAminoMsg(message: Commission): CommissionAminoMsg {
    return {
      type: "cosmos-sdk/Commission",
      value: Commission.toAmino(message),
    };
  },
  fromProtoMsg(message: CommissionProtoMsg): Commission {
    return Commission.decode(message.value);
  },
  toProto(message: Commission): Uint8Array {
    return Commission.encode(message).finish();
  },
  toProtoMsg(message: Commission): CommissionProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.Commission",
      value: Commission.encode(message).finish(),
    };
  },
};
function createBaseDescription(): Description {
  return {
    moniker: "",
    identity: "",
    website: "",
    securityContact: "",
    details: "",
  };
}
export const Description = {
  typeUrl: "/cosmos.staking.v1beta1.Description",
  encode(
    message: Description,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.moniker !== "") {
      writer.uint32(10).string(message.moniker);
    }
    if (message.identity !== "") {
      writer.uint32(18).string(message.identity);
    }
    if (message.website !== "") {
      writer.uint32(26).string(message.website);
    }
    if (message.securityContact !== "") {
      writer.uint32(34).string(message.securityContact);
    }
    if (message.details !== "") {
      writer.uint32(42).string(message.details);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Description {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDescription();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.moniker = reader.string();
          break;
        case 2:
          message.identity = reader.string();
          break;
        case 3:
          message.website = reader.string();
          break;
        case 4:
          message.securityContact = reader.string();
          break;
        case 5:
          message.details = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Description>): Description {
    const message = createBaseDescription();
    message.moniker = object.moniker ?? "";
    message.identity = object.identity ?? "";
    message.website = object.website ?? "";
    message.securityContact = object.securityContact ?? "";
    message.details = object.details ?? "";
    return message;
  },
  fromAmino(object: DescriptionAmino): Description {
    return {
      moniker: object.moniker,
      identity: object.identity,
      website: object.website,
      securityContact: object.security_contact,
      details: object.details,
    };
  },
  toAmino(message: Description): DescriptionAmino {
    const obj: any = {};
    obj.moniker = message.moniker;
    obj.identity = message.identity;
    obj.website = message.website;
    obj.security_contact = message.securityContact;
    obj.details = message.details;
    return obj;
  },
  fromAminoMsg(object: DescriptionAminoMsg): Description {
    return Description.fromAmino(object.value);
  },
  toAminoMsg(message: Description): DescriptionAminoMsg {
    return {
      type: "cosmos-sdk/Description",
      value: Description.toAmino(message),
    };
  },
  fromProtoMsg(message: DescriptionProtoMsg): Description {
    return Description.decode(message.value);
  },
  toProto(message: Description): Uint8Array {
    return Description.encode(message).finish();
  },
  toProtoMsg(message: Description): DescriptionProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.Description",
      value: Description.encode(message).finish(),
    };
  },
};
function createBaseValidator(): Validator {
  return {
    operatorAddress: "",
    consensusPubkey: undefined,
    jailed: false,
    status: 0,
    tokens: "",
    delegatorShares: "",
    description: Description.fromPartial({}),
    unbondingHeight: BigInt(0),
    unbondingTime: undefined,
    commission: Commission.fromPartial({}),
    minSelfDelegation: "",
  };
}
export const Validator = {
  typeUrl: "/cosmos.staking.v1beta1.Validator",
  encode(
    message: Validator,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.operatorAddress !== "") {
      writer.uint32(10).string(message.operatorAddress);
    }
    if (message.consensusPubkey !== undefined) {
      Any.encode(
        message.consensusPubkey as Any,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.jailed === true) {
      writer.uint32(24).bool(message.jailed);
    }
    if (message.status !== 0) {
      writer.uint32(32).int32(message.status);
    }
    if (message.tokens !== "") {
      writer.uint32(42).string(message.tokens);
    }
    if (message.delegatorShares !== "") {
      writer
        .uint32(50)
        .string(Decimal.fromUserInput(message.delegatorShares, 18).atomics);
    }
    if (message.description !== undefined) {
      Description.encode(
        message.description,
        writer.uint32(58).fork()
      ).ldelim();
    }
    if (message.unbondingHeight !== BigInt(0)) {
      writer.uint32(64).int64(message.unbondingHeight);
    }
    if (message.unbondingTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.unbondingTime),
        writer.uint32(74).fork()
      ).ldelim();
    }
    if (message.commission !== undefined) {
      Commission.encode(message.commission, writer.uint32(82).fork()).ldelim();
    }
    if (message.minSelfDelegation !== "") {
      writer.uint32(90).string(message.minSelfDelegation);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Validator {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.operatorAddress = reader.string();
          break;
        case 2:
          message.consensusPubkey = Cosmos_cryptoPubKey_InterfaceDecoder(
            reader
          ) as Any;
          break;
        case 3:
          message.jailed = reader.bool();
          break;
        case 4:
          message.status = reader.int32() as any;
          break;
        case 5:
          message.tokens = reader.string();
          break;
        case 6:
          message.delegatorShares = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        case 7:
          message.description = Description.decode(reader, reader.uint32());
          break;
        case 8:
          message.unbondingHeight = reader.int64();
          break;
        case 9:
          message.unbondingTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 10:
          message.commission = Commission.decode(reader, reader.uint32());
          break;
        case 11:
          message.minSelfDelegation = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Validator>): Validator {
    const message = createBaseValidator();
    message.operatorAddress = object.operatorAddress ?? "";
    message.consensusPubkey =
      object.consensusPubkey !== undefined && object.consensusPubkey !== null
        ? Any.fromPartial(object.consensusPubkey)
        : undefined;
    message.jailed = object.jailed ?? false;
    message.status = object.status ?? 0;
    message.tokens = object.tokens ?? "";
    message.delegatorShares = object.delegatorShares ?? "";
    message.description =
      object.description !== undefined && object.description !== null
        ? Description.fromPartial(object.description)
        : undefined;
    message.unbondingHeight =
      object.unbondingHeight !== undefined && object.unbondingHeight !== null
        ? BigInt(object.unbondingHeight.toString())
        : BigInt(0);
    message.unbondingTime = object.unbondingTime ?? undefined;
    message.commission =
      object.commission !== undefined && object.commission !== null
        ? Commission.fromPartial(object.commission)
        : undefined;
    message.minSelfDelegation = object.minSelfDelegation ?? "";
    return message;
  },
  fromAmino(object: ValidatorAmino): Validator {
    return {
      operatorAddress: object.operator_address,
      consensusPubkey: encodeBech32Pubkey(
        {
          type: "tendermint/PubKeySecp256k1",
          value: toBase64(object.consensus_pubkey.value),
        },
        "cosmos"
      ),
      jailed: object.jailed,
      status: isSet(object.status) ? bondStatusFromJSON(object.status) : -1,
      tokens: object.tokens,
      delegatorShares: object.delegator_shares,
      description: object?.description
        ? Description.fromAmino(object.description)
        : undefined,
      unbondingHeight: BigInt(object.unbonding_height),
      unbondingTime: object.unbonding_time,
      commission: object?.commission
        ? Commission.fromAmino(object.commission)
        : undefined,
      minSelfDelegation: object.min_self_delegation,
    };
  },
  toAmino(message: Validator): ValidatorAmino {
    const obj: any = {};
    obj.operator_address = message.operatorAddress;
    obj.consensus_pubkey = message.consensusPubkey
      ? {
          typeUrl: "/cosmos.crypto.secp256k1.PubKey",
          value: fromBase64(decodeBech32Pubkey(message.consensusPubkey).value),
        }
      : undefined;
    obj.jailed = message.jailed;
    obj.status = message.status;
    obj.tokens = message.tokens;
    obj.delegator_shares = message.delegatorShares;
    obj.description = message.description
      ? Description.toAmino(message.description)
      : undefined;
    obj.unbonding_height = message.unbondingHeight
      ? message.unbondingHeight.toString()
      : undefined;
    obj.unbonding_time = message.unbondingTime;
    obj.commission = message.commission
      ? Commission.toAmino(message.commission)
      : undefined;
    obj.min_self_delegation = message.minSelfDelegation;
    return obj;
  },
  fromAminoMsg(object: ValidatorAminoMsg): Validator {
    return Validator.fromAmino(object.value);
  },
  toAminoMsg(message: Validator): ValidatorAminoMsg {
    return {
      type: "cosmos-sdk/Validator",
      value: Validator.toAmino(message),
    };
  },
  fromProtoMsg(message: ValidatorProtoMsg): Validator {
    return Validator.decode(message.value);
  },
  toProto(message: Validator): Uint8Array {
    return Validator.encode(message).finish();
  },
  toProtoMsg(message: Validator): ValidatorProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.Validator",
      value: Validator.encode(message).finish(),
    };
  },
};
function createBaseValAddresses(): ValAddresses {
  return {
    addresses: [],
  };
}
export const ValAddresses = {
  typeUrl: "/cosmos.staking.v1beta1.ValAddresses",
  encode(
    message: ValAddresses,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.addresses) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ValAddresses {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValAddresses();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addresses.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ValAddresses>): ValAddresses {
    const message = createBaseValAddresses();
    message.addresses = object.addresses?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ValAddressesAmino): ValAddresses {
    return {
      addresses: Array.isArray(object?.addresses)
        ? object.addresses.map((e: any) => e)
        : [],
    };
  },
  toAmino(message: ValAddresses): ValAddressesAmino {
    const obj: any = {};
    if (message.addresses) {
      obj.addresses = message.addresses.map((e) => e);
    } else {
      obj.addresses = [];
    }
    return obj;
  },
  fromAminoMsg(object: ValAddressesAminoMsg): ValAddresses {
    return ValAddresses.fromAmino(object.value);
  },
  toAminoMsg(message: ValAddresses): ValAddressesAminoMsg {
    return {
      type: "cosmos-sdk/ValAddresses",
      value: ValAddresses.toAmino(message),
    };
  },
  fromProtoMsg(message: ValAddressesProtoMsg): ValAddresses {
    return ValAddresses.decode(message.value);
  },
  toProto(message: ValAddresses): Uint8Array {
    return ValAddresses.encode(message).finish();
  },
  toProtoMsg(message: ValAddresses): ValAddressesProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.ValAddresses",
      value: ValAddresses.encode(message).finish(),
    };
  },
};
function createBaseDVPair(): DVPair {
  return {
    delegatorAddress: "",
    validatorAddress: "",
  };
}
export const DVPair = {
  typeUrl: "/cosmos.staking.v1beta1.DVPair",
  encode(
    message: DVPair,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.delegatorAddress !== "") {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== "") {
      writer.uint32(18).string(message.validatorAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DVPair {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDVPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<DVPair>): DVPair {
    const message = createBaseDVPair();
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorAddress = object.validatorAddress ?? "";
    return message;
  },
  fromAmino(object: DVPairAmino): DVPair {
    return {
      delegatorAddress: object.delegator_address,
      validatorAddress: object.validator_address,
    };
  },
  toAmino(message: DVPair): DVPairAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress;
    obj.validator_address = message.validatorAddress;
    return obj;
  },
  fromAminoMsg(object: DVPairAminoMsg): DVPair {
    return DVPair.fromAmino(object.value);
  },
  toAminoMsg(message: DVPair): DVPairAminoMsg {
    return {
      type: "cosmos-sdk/DVPair",
      value: DVPair.toAmino(message),
    };
  },
  fromProtoMsg(message: DVPairProtoMsg): DVPair {
    return DVPair.decode(message.value);
  },
  toProto(message: DVPair): Uint8Array {
    return DVPair.encode(message).finish();
  },
  toProtoMsg(message: DVPair): DVPairProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.DVPair",
      value: DVPair.encode(message).finish(),
    };
  },
};
function createBaseDVPairs(): DVPairs {
  return {
    pairs: [],
  };
}
export const DVPairs = {
  typeUrl: "/cosmos.staking.v1beta1.DVPairs",
  encode(
    message: DVPairs,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.pairs) {
      DVPair.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DVPairs {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDVPairs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pairs.push(DVPair.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<DVPairs>): DVPairs {
    const message = createBaseDVPairs();
    message.pairs = object.pairs?.map((e) => DVPair.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: DVPairsAmino): DVPairs {
    return {
      pairs: Array.isArray(object?.pairs)
        ? object.pairs.map((e: any) => DVPair.fromAmino(e))
        : [],
    };
  },
  toAmino(message: DVPairs): DVPairsAmino {
    const obj: any = {};
    if (message.pairs) {
      obj.pairs = message.pairs.map((e) => (e ? DVPair.toAmino(e) : undefined));
    } else {
      obj.pairs = [];
    }
    return obj;
  },
  fromAminoMsg(object: DVPairsAminoMsg): DVPairs {
    return DVPairs.fromAmino(object.value);
  },
  toAminoMsg(message: DVPairs): DVPairsAminoMsg {
    return {
      type: "cosmos-sdk/DVPairs",
      value: DVPairs.toAmino(message),
    };
  },
  fromProtoMsg(message: DVPairsProtoMsg): DVPairs {
    return DVPairs.decode(message.value);
  },
  toProto(message: DVPairs): Uint8Array {
    return DVPairs.encode(message).finish();
  },
  toProtoMsg(message: DVPairs): DVPairsProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.DVPairs",
      value: DVPairs.encode(message).finish(),
    };
  },
};
function createBaseDVVTriplet(): DVVTriplet {
  return {
    delegatorAddress: "",
    validatorSrcAddress: "",
    validatorDstAddress: "",
  };
}
export const DVVTriplet = {
  typeUrl: "/cosmos.staking.v1beta1.DVVTriplet",
  encode(
    message: DVVTriplet,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.delegatorAddress !== "") {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorSrcAddress !== "") {
      writer.uint32(18).string(message.validatorSrcAddress);
    }
    if (message.validatorDstAddress !== "") {
      writer.uint32(26).string(message.validatorDstAddress);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DVVTriplet {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDVVTriplet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorSrcAddress = reader.string();
          break;
        case 3:
          message.validatorDstAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<DVVTriplet>): DVVTriplet {
    const message = createBaseDVVTriplet();
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorSrcAddress = object.validatorSrcAddress ?? "";
    message.validatorDstAddress = object.validatorDstAddress ?? "";
    return message;
  },
  fromAmino(object: DVVTripletAmino): DVVTriplet {
    return {
      delegatorAddress: object.delegator_address,
      validatorSrcAddress: object.validator_src_address,
      validatorDstAddress: object.validator_dst_address,
    };
  },
  toAmino(message: DVVTriplet): DVVTripletAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress;
    obj.validator_src_address = message.validatorSrcAddress;
    obj.validator_dst_address = message.validatorDstAddress;
    return obj;
  },
  fromAminoMsg(object: DVVTripletAminoMsg): DVVTriplet {
    return DVVTriplet.fromAmino(object.value);
  },
  toAminoMsg(message: DVVTriplet): DVVTripletAminoMsg {
    return {
      type: "cosmos-sdk/DVVTriplet",
      value: DVVTriplet.toAmino(message),
    };
  },
  fromProtoMsg(message: DVVTripletProtoMsg): DVVTriplet {
    return DVVTriplet.decode(message.value);
  },
  toProto(message: DVVTriplet): Uint8Array {
    return DVVTriplet.encode(message).finish();
  },
  toProtoMsg(message: DVVTriplet): DVVTripletProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.DVVTriplet",
      value: DVVTriplet.encode(message).finish(),
    };
  },
};
function createBaseDVVTriplets(): DVVTriplets {
  return {
    triplets: [],
  };
}
export const DVVTriplets = {
  typeUrl: "/cosmos.staking.v1beta1.DVVTriplets",
  encode(
    message: DVVTriplets,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.triplets) {
      DVVTriplet.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DVVTriplets {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDVVTriplets();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.triplets.push(DVVTriplet.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<DVVTriplets>): DVVTriplets {
    const message = createBaseDVVTriplets();
    message.triplets =
      object.triplets?.map((e) => DVVTriplet.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: DVVTripletsAmino): DVVTriplets {
    return {
      triplets: Array.isArray(object?.triplets)
        ? object.triplets.map((e: any) => DVVTriplet.fromAmino(e))
        : [],
    };
  },
  toAmino(message: DVVTriplets): DVVTripletsAmino {
    const obj: any = {};
    if (message.triplets) {
      obj.triplets = message.triplets.map((e) =>
        e ? DVVTriplet.toAmino(e) : undefined
      );
    } else {
      obj.triplets = [];
    }
    return obj;
  },
  fromAminoMsg(object: DVVTripletsAminoMsg): DVVTriplets {
    return DVVTriplets.fromAmino(object.value);
  },
  toAminoMsg(message: DVVTriplets): DVVTripletsAminoMsg {
    return {
      type: "cosmos-sdk/DVVTriplets",
      value: DVVTriplets.toAmino(message),
    };
  },
  fromProtoMsg(message: DVVTripletsProtoMsg): DVVTriplets {
    return DVVTriplets.decode(message.value);
  },
  toProto(message: DVVTriplets): Uint8Array {
    return DVVTriplets.encode(message).finish();
  },
  toProtoMsg(message: DVVTriplets): DVVTripletsProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.DVVTriplets",
      value: DVVTriplets.encode(message).finish(),
    };
  },
};
function createBaseDelegation(): Delegation {
  return {
    delegatorAddress: "",
    validatorAddress: "",
    shares: "",
  };
}
export const Delegation = {
  typeUrl: "/cosmos.staking.v1beta1.Delegation",
  encode(
    message: Delegation,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.delegatorAddress !== "") {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== "") {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.shares !== "") {
      writer
        .uint32(26)
        .string(Decimal.fromUserInput(message.shares, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Delegation {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.shares = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Delegation>): Delegation {
    const message = createBaseDelegation();
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorAddress = object.validatorAddress ?? "";
    message.shares = object.shares ?? "";
    return message;
  },
  fromAmino(object: DelegationAmino): Delegation {
    return {
      delegatorAddress: object.delegator_address,
      validatorAddress: object.validator_address,
      shares: object.shares,
    };
  },
  toAmino(message: Delegation): DelegationAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress;
    obj.validator_address = message.validatorAddress;
    obj.shares = message.shares;
    return obj;
  },
  fromAminoMsg(object: DelegationAminoMsg): Delegation {
    return Delegation.fromAmino(object.value);
  },
  toAminoMsg(message: Delegation): DelegationAminoMsg {
    return {
      type: "cosmos-sdk/Delegation",
      value: Delegation.toAmino(message),
    };
  },
  fromProtoMsg(message: DelegationProtoMsg): Delegation {
    return Delegation.decode(message.value);
  },
  toProto(message: Delegation): Uint8Array {
    return Delegation.encode(message).finish();
  },
  toProtoMsg(message: Delegation): DelegationProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.Delegation",
      value: Delegation.encode(message).finish(),
    };
  },
};
function createBaseUnbondingDelegation(): UnbondingDelegation {
  return {
    delegatorAddress: "",
    validatorAddress: "",
    entries: [],
  };
}
export const UnbondingDelegation = {
  typeUrl: "/cosmos.staking.v1beta1.UnbondingDelegation",
  encode(
    message: UnbondingDelegation,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.delegatorAddress !== "") {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== "") {
      writer.uint32(18).string(message.validatorAddress);
    }
    for (const v of message.entries) {
      UnbondingDelegationEntry.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): UnbondingDelegation {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUnbondingDelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.entries.push(
            UnbondingDelegationEntry.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<UnbondingDelegation>): UnbondingDelegation {
    const message = createBaseUnbondingDelegation();
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorAddress = object.validatorAddress ?? "";
    message.entries =
      object.entries?.map((e) => UnbondingDelegationEntry.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: UnbondingDelegationAmino): UnbondingDelegation {
    return {
      delegatorAddress: object.delegator_address,
      validatorAddress: object.validator_address,
      entries: Array.isArray(object?.entries)
        ? object.entries.map((e: any) => UnbondingDelegationEntry.fromAmino(e))
        : [],
    };
  },
  toAmino(message: UnbondingDelegation): UnbondingDelegationAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress;
    obj.validator_address = message.validatorAddress;
    if (message.entries) {
      obj.entries = message.entries.map((e) =>
        e ? UnbondingDelegationEntry.toAmino(e) : undefined
      );
    } else {
      obj.entries = [];
    }
    return obj;
  },
  fromAminoMsg(object: UnbondingDelegationAminoMsg): UnbondingDelegation {
    return UnbondingDelegation.fromAmino(object.value);
  },
  toAminoMsg(message: UnbondingDelegation): UnbondingDelegationAminoMsg {
    return {
      type: "cosmos-sdk/UnbondingDelegation",
      value: UnbondingDelegation.toAmino(message),
    };
  },
  fromProtoMsg(message: UnbondingDelegationProtoMsg): UnbondingDelegation {
    return UnbondingDelegation.decode(message.value);
  },
  toProto(message: UnbondingDelegation): Uint8Array {
    return UnbondingDelegation.encode(message).finish();
  },
  toProtoMsg(message: UnbondingDelegation): UnbondingDelegationProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.UnbondingDelegation",
      value: UnbondingDelegation.encode(message).finish(),
    };
  },
};
function createBaseUnbondingDelegationEntry(): UnbondingDelegationEntry {
  return {
    creationHeight: BigInt(0),
    completionTime: undefined,
    initialBalance: "",
    balance: "",
  };
}
export const UnbondingDelegationEntry = {
  typeUrl: "/cosmos.staking.v1beta1.UnbondingDelegationEntry",
  encode(
    message: UnbondingDelegationEntry,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.creationHeight !== BigInt(0)) {
      writer.uint32(8).int64(message.creationHeight);
    }
    if (message.completionTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.completionTime),
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.initialBalance !== "") {
      writer.uint32(26).string(message.initialBalance);
    }
    if (message.balance !== "") {
      writer.uint32(34).string(message.balance);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): UnbondingDelegationEntry {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUnbondingDelegationEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creationHeight = reader.int64();
          break;
        case 2:
          message.completionTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.initialBalance = reader.string();
          break;
        case 4:
          message.balance = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<UnbondingDelegationEntry>
  ): UnbondingDelegationEntry {
    const message = createBaseUnbondingDelegationEntry();
    message.creationHeight =
      object.creationHeight !== undefined && object.creationHeight !== null
        ? BigInt(object.creationHeight.toString())
        : BigInt(0);
    message.completionTime = object.completionTime ?? undefined;
    message.initialBalance = object.initialBalance ?? "";
    message.balance = object.balance ?? "";
    return message;
  },
  fromAmino(object: UnbondingDelegationEntryAmino): UnbondingDelegationEntry {
    return {
      creationHeight: BigInt(object.creation_height),
      completionTime: object.completion_time,
      initialBalance: object.initial_balance,
      balance: object.balance,
    };
  },
  toAmino(message: UnbondingDelegationEntry): UnbondingDelegationEntryAmino {
    const obj: any = {};
    obj.creation_height = message.creationHeight
      ? message.creationHeight.toString()
      : undefined;
    obj.completion_time = message.completionTime;
    obj.initial_balance = message.initialBalance;
    obj.balance = message.balance;
    return obj;
  },
  fromAminoMsg(
    object: UnbondingDelegationEntryAminoMsg
  ): UnbondingDelegationEntry {
    return UnbondingDelegationEntry.fromAmino(object.value);
  },
  toAminoMsg(
    message: UnbondingDelegationEntry
  ): UnbondingDelegationEntryAminoMsg {
    return {
      type: "cosmos-sdk/UnbondingDelegationEntry",
      value: UnbondingDelegationEntry.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UnbondingDelegationEntryProtoMsg
  ): UnbondingDelegationEntry {
    return UnbondingDelegationEntry.decode(message.value);
  },
  toProto(message: UnbondingDelegationEntry): Uint8Array {
    return UnbondingDelegationEntry.encode(message).finish();
  },
  toProtoMsg(
    message: UnbondingDelegationEntry
  ): UnbondingDelegationEntryProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.UnbondingDelegationEntry",
      value: UnbondingDelegationEntry.encode(message).finish(),
    };
  },
};
function createBaseRedelegationEntry(): RedelegationEntry {
  return {
    creationHeight: BigInt(0),
    completionTime: undefined,
    initialBalance: "",
    sharesDst: "",
  };
}
export const RedelegationEntry = {
  typeUrl: "/cosmos.staking.v1beta1.RedelegationEntry",
  encode(
    message: RedelegationEntry,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.creationHeight !== BigInt(0)) {
      writer.uint32(8).int64(message.creationHeight);
    }
    if (message.completionTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.completionTime),
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.initialBalance !== "") {
      writer.uint32(26).string(message.initialBalance);
    }
    if (message.sharesDst !== "") {
      writer
        .uint32(34)
        .string(Decimal.fromUserInput(message.sharesDst, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RedelegationEntry {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRedelegationEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creationHeight = reader.int64();
          break;
        case 2:
          message.completionTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.initialBalance = reader.string();
          break;
        case 4:
          message.sharesDst = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<RedelegationEntry>): RedelegationEntry {
    const message = createBaseRedelegationEntry();
    message.creationHeight =
      object.creationHeight !== undefined && object.creationHeight !== null
        ? BigInt(object.creationHeight.toString())
        : BigInt(0);
    message.completionTime = object.completionTime ?? undefined;
    message.initialBalance = object.initialBalance ?? "";
    message.sharesDst = object.sharesDst ?? "";
    return message;
  },
  fromAmino(object: RedelegationEntryAmino): RedelegationEntry {
    return {
      creationHeight: BigInt(object.creation_height),
      completionTime: object.completion_time,
      initialBalance: object.initial_balance,
      sharesDst: object.shares_dst,
    };
  },
  toAmino(message: RedelegationEntry): RedelegationEntryAmino {
    const obj: any = {};
    obj.creation_height = message.creationHeight
      ? message.creationHeight.toString()
      : undefined;
    obj.completion_time = message.completionTime;
    obj.initial_balance = message.initialBalance;
    obj.shares_dst = message.sharesDst;
    return obj;
  },
  fromAminoMsg(object: RedelegationEntryAminoMsg): RedelegationEntry {
    return RedelegationEntry.fromAmino(object.value);
  },
  toAminoMsg(message: RedelegationEntry): RedelegationEntryAminoMsg {
    return {
      type: "cosmos-sdk/RedelegationEntry",
      value: RedelegationEntry.toAmino(message),
    };
  },
  fromProtoMsg(message: RedelegationEntryProtoMsg): RedelegationEntry {
    return RedelegationEntry.decode(message.value);
  },
  toProto(message: RedelegationEntry): Uint8Array {
    return RedelegationEntry.encode(message).finish();
  },
  toProtoMsg(message: RedelegationEntry): RedelegationEntryProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.RedelegationEntry",
      value: RedelegationEntry.encode(message).finish(),
    };
  },
};
function createBaseRedelegation(): Redelegation {
  return {
    delegatorAddress: "",
    validatorSrcAddress: "",
    validatorDstAddress: "",
    entries: [],
  };
}
export const Redelegation = {
  typeUrl: "/cosmos.staking.v1beta1.Redelegation",
  encode(
    message: Redelegation,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.delegatorAddress !== "") {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorSrcAddress !== "") {
      writer.uint32(18).string(message.validatorSrcAddress);
    }
    if (message.validatorDstAddress !== "") {
      writer.uint32(26).string(message.validatorDstAddress);
    }
    for (const v of message.entries) {
      RedelegationEntry.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Redelegation {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRedelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorSrcAddress = reader.string();
          break;
        case 3:
          message.validatorDstAddress = reader.string();
          break;
        case 4:
          message.entries.push(
            RedelegationEntry.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Redelegation>): Redelegation {
    const message = createBaseRedelegation();
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorSrcAddress = object.validatorSrcAddress ?? "";
    message.validatorDstAddress = object.validatorDstAddress ?? "";
    message.entries =
      object.entries?.map((e) => RedelegationEntry.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: RedelegationAmino): Redelegation {
    return {
      delegatorAddress: object.delegator_address,
      validatorSrcAddress: object.validator_src_address,
      validatorDstAddress: object.validator_dst_address,
      entries: Array.isArray(object?.entries)
        ? object.entries.map((e: any) => RedelegationEntry.fromAmino(e))
        : [],
    };
  },
  toAmino(message: Redelegation): RedelegationAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress;
    obj.validator_src_address = message.validatorSrcAddress;
    obj.validator_dst_address = message.validatorDstAddress;
    if (message.entries) {
      obj.entries = message.entries.map((e) =>
        e ? RedelegationEntry.toAmino(e) : undefined
      );
    } else {
      obj.entries = [];
    }
    return obj;
  },
  fromAminoMsg(object: RedelegationAminoMsg): Redelegation {
    return Redelegation.fromAmino(object.value);
  },
  toAminoMsg(message: Redelegation): RedelegationAminoMsg {
    return {
      type: "cosmos-sdk/Redelegation",
      value: Redelegation.toAmino(message),
    };
  },
  fromProtoMsg(message: RedelegationProtoMsg): Redelegation {
    return Redelegation.decode(message.value);
  },
  toProto(message: Redelegation): Uint8Array {
    return Redelegation.encode(message).finish();
  },
  toProtoMsg(message: Redelegation): RedelegationProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.Redelegation",
      value: Redelegation.encode(message).finish(),
    };
  },
};
function createBaseParams(): Params {
  return {
    unbondingTime: undefined,
    maxValidators: 0,
    maxEntries: 0,
    historicalEntries: 0,
    bondDenom: "",
    minCommissionRate: "",
  };
}
export const Params = {
  typeUrl: "/cosmos.staking.v1beta1.Params",
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.unbondingTime !== undefined) {
      Duration.encode(message.unbondingTime, writer.uint32(10).fork()).ldelim();
    }
    if (message.maxValidators !== 0) {
      writer.uint32(16).uint32(message.maxValidators);
    }
    if (message.maxEntries !== 0) {
      writer.uint32(24).uint32(message.maxEntries);
    }
    if (message.historicalEntries !== 0) {
      writer.uint32(32).uint32(message.historicalEntries);
    }
    if (message.bondDenom !== "") {
      writer.uint32(42).string(message.bondDenom);
    }
    if (message.minCommissionRate !== "") {
      writer
        .uint32(50)
        .string(Decimal.fromUserInput(message.minCommissionRate, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.unbondingTime = Duration.decode(reader, reader.uint32());
          break;
        case 2:
          message.maxValidators = reader.uint32();
          break;
        case 3:
          message.maxEntries = reader.uint32();
          break;
        case 4:
          message.historicalEntries = reader.uint32();
          break;
        case 5:
          message.bondDenom = reader.string();
          break;
        case 6:
          message.minCommissionRate = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.unbondingTime =
      object.unbondingTime !== undefined && object.unbondingTime !== null
        ? Duration.fromPartial(object.unbondingTime)
        : undefined;
    message.maxValidators = object.maxValidators ?? 0;
    message.maxEntries = object.maxEntries ?? 0;
    message.historicalEntries = object.historicalEntries ?? 0;
    message.bondDenom = object.bondDenom ?? "";
    message.minCommissionRate = object.minCommissionRate ?? "";
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      unbondingTime: object?.unbonding_time
        ? Duration.fromAmino(object.unbonding_time)
        : undefined,
      maxValidators: object.max_validators,
      maxEntries: object.max_entries,
      historicalEntries: object.historical_entries,
      bondDenom: object.bond_denom,
      minCommissionRate: object.min_commission_rate,
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.unbonding_time = message.unbondingTime
      ? Duration.toAmino(message.unbondingTime)
      : undefined;
    obj.max_validators = message.maxValidators;
    obj.max_entries = message.maxEntries;
    obj.historical_entries = message.historicalEntries;
    obj.bond_denom = message.bondDenom;
    obj.min_commission_rate = message.minCommissionRate;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "cosmos-sdk/Params",
      value: Params.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseDelegationResponse(): DelegationResponse {
  return {
    delegation: Delegation.fromPartial({}),
    balance: undefined,
  };
}
export const DelegationResponse = {
  typeUrl: "/cosmos.staking.v1beta1.DelegationResponse",
  encode(
    message: DelegationResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.delegation !== undefined) {
      Delegation.encode(message.delegation, writer.uint32(10).fork()).ldelim();
    }
    if (message.balance !== undefined) {
      Coin.encode(message.balance, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): DelegationResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegation = Delegation.decode(reader, reader.uint32());
          break;
        case 2:
          message.balance = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<DelegationResponse>): DelegationResponse {
    const message = createBaseDelegationResponse();
    message.delegation =
      object.delegation !== undefined && object.delegation !== null
        ? Delegation.fromPartial(object.delegation)
        : undefined;
    message.balance =
      object.balance !== undefined && object.balance !== null
        ? Coin.fromPartial(object.balance)
        : undefined;
    return message;
  },
  fromAmino(object: DelegationResponseAmino): DelegationResponse {
    return {
      delegation: object?.delegation
        ? Delegation.fromAmino(object.delegation)
        : undefined,
      balance: object?.balance ? Coin.fromAmino(object.balance) : undefined,
    };
  },
  toAmino(message: DelegationResponse): DelegationResponseAmino {
    const obj: any = {};
    obj.delegation = message.delegation
      ? Delegation.toAmino(message.delegation)
      : undefined;
    obj.balance = message.balance ? Coin.toAmino(message.balance) : undefined;
    return obj;
  },
  fromAminoMsg(object: DelegationResponseAminoMsg): DelegationResponse {
    return DelegationResponse.fromAmino(object.value);
  },
  toAminoMsg(message: DelegationResponse): DelegationResponseAminoMsg {
    return {
      type: "cosmos-sdk/DelegationResponse",
      value: DelegationResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: DelegationResponseProtoMsg): DelegationResponse {
    return DelegationResponse.decode(message.value);
  },
  toProto(message: DelegationResponse): Uint8Array {
    return DelegationResponse.encode(message).finish();
  },
  toProtoMsg(message: DelegationResponse): DelegationResponseProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.DelegationResponse",
      value: DelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseRedelegationEntryResponse(): RedelegationEntryResponse {
  return {
    redelegationEntry: RedelegationEntry.fromPartial({}),
    balance: "",
  };
}
export const RedelegationEntryResponse = {
  typeUrl: "/cosmos.staking.v1beta1.RedelegationEntryResponse",
  encode(
    message: RedelegationEntryResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.redelegationEntry !== undefined) {
      RedelegationEntry.encode(
        message.redelegationEntry,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.balance !== "") {
      writer.uint32(34).string(message.balance);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): RedelegationEntryResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRedelegationEntryResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.redelegationEntry = RedelegationEntry.decode(
            reader,
            reader.uint32()
          );
          break;
        case 4:
          message.balance = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<RedelegationEntryResponse>
  ): RedelegationEntryResponse {
    const message = createBaseRedelegationEntryResponse();
    message.redelegationEntry =
      object.redelegationEntry !== undefined &&
      object.redelegationEntry !== null
        ? RedelegationEntry.fromPartial(object.redelegationEntry)
        : undefined;
    message.balance = object.balance ?? "";
    return message;
  },
  fromAmino(object: RedelegationEntryResponseAmino): RedelegationEntryResponse {
    return {
      redelegationEntry: object?.redelegation_entry
        ? RedelegationEntry.fromAmino(object.redelegation_entry)
        : undefined,
      balance: object.balance,
    };
  },
  toAmino(message: RedelegationEntryResponse): RedelegationEntryResponseAmino {
    const obj: any = {};
    obj.redelegation_entry = message.redelegationEntry
      ? RedelegationEntry.toAmino(message.redelegationEntry)
      : undefined;
    obj.balance = message.balance;
    return obj;
  },
  fromAminoMsg(
    object: RedelegationEntryResponseAminoMsg
  ): RedelegationEntryResponse {
    return RedelegationEntryResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: RedelegationEntryResponse
  ): RedelegationEntryResponseAminoMsg {
    return {
      type: "cosmos-sdk/RedelegationEntryResponse",
      value: RedelegationEntryResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: RedelegationEntryResponseProtoMsg
  ): RedelegationEntryResponse {
    return RedelegationEntryResponse.decode(message.value);
  },
  toProto(message: RedelegationEntryResponse): Uint8Array {
    return RedelegationEntryResponse.encode(message).finish();
  },
  toProtoMsg(
    message: RedelegationEntryResponse
  ): RedelegationEntryResponseProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.RedelegationEntryResponse",
      value: RedelegationEntryResponse.encode(message).finish(),
    };
  },
};
function createBaseRedelegationResponse(): RedelegationResponse {
  return {
    redelegation: Redelegation.fromPartial({}),
    entries: [],
  };
}
export const RedelegationResponse = {
  typeUrl: "/cosmos.staking.v1beta1.RedelegationResponse",
  encode(
    message: RedelegationResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.redelegation !== undefined) {
      Redelegation.encode(
        message.redelegation,
        writer.uint32(10).fork()
      ).ldelim();
    }
    for (const v of message.entries) {
      RedelegationEntryResponse.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): RedelegationResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRedelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.redelegation = Redelegation.decode(reader, reader.uint32());
          break;
        case 2:
          message.entries.push(
            RedelegationEntryResponse.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<RedelegationResponse>): RedelegationResponse {
    const message = createBaseRedelegationResponse();
    message.redelegation =
      object.redelegation !== undefined && object.redelegation !== null
        ? Redelegation.fromPartial(object.redelegation)
        : undefined;
    message.entries =
      object.entries?.map((e) => RedelegationEntryResponse.fromPartial(e)) ||
      [];
    return message;
  },
  fromAmino(object: RedelegationResponseAmino): RedelegationResponse {
    return {
      redelegation: object?.redelegation
        ? Redelegation.fromAmino(object.redelegation)
        : undefined,
      entries: Array.isArray(object?.entries)
        ? object.entries.map((e: any) => RedelegationEntryResponse.fromAmino(e))
        : [],
    };
  },
  toAmino(message: RedelegationResponse): RedelegationResponseAmino {
    const obj: any = {};
    obj.redelegation = message.redelegation
      ? Redelegation.toAmino(message.redelegation)
      : undefined;
    if (message.entries) {
      obj.entries = message.entries.map((e) =>
        e ? RedelegationEntryResponse.toAmino(e) : undefined
      );
    } else {
      obj.entries = [];
    }
    return obj;
  },
  fromAminoMsg(object: RedelegationResponseAminoMsg): RedelegationResponse {
    return RedelegationResponse.fromAmino(object.value);
  },
  toAminoMsg(message: RedelegationResponse): RedelegationResponseAminoMsg {
    return {
      type: "cosmos-sdk/RedelegationResponse",
      value: RedelegationResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: RedelegationResponseProtoMsg): RedelegationResponse {
    return RedelegationResponse.decode(message.value);
  },
  toProto(message: RedelegationResponse): Uint8Array {
    return RedelegationResponse.encode(message).finish();
  },
  toProtoMsg(message: RedelegationResponse): RedelegationResponseProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.RedelegationResponse",
      value: RedelegationResponse.encode(message).finish(),
    };
  },
};
function createBasePool(): Pool {
  return {
    notBondedTokens: "",
    bondedTokens: "",
  };
}
export const Pool = {
  typeUrl: "/cosmos.staking.v1beta1.Pool",
  encode(
    message: Pool,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.notBondedTokens !== "") {
      writer.uint32(10).string(message.notBondedTokens);
    }
    if (message.bondedTokens !== "") {
      writer.uint32(18).string(message.bondedTokens);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Pool {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.notBondedTokens = reader.string();
          break;
        case 2:
          message.bondedTokens = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Pool>): Pool {
    const message = createBasePool();
    message.notBondedTokens = object.notBondedTokens ?? "";
    message.bondedTokens = object.bondedTokens ?? "";
    return message;
  },
  fromAmino(object: PoolAmino): Pool {
    return {
      notBondedTokens: object.not_bonded_tokens,
      bondedTokens: object.bonded_tokens,
    };
  },
  toAmino(message: Pool): PoolAmino {
    const obj: any = {};
    obj.not_bonded_tokens = message.notBondedTokens;
    obj.bonded_tokens = message.bondedTokens;
    return obj;
  },
  fromAminoMsg(object: PoolAminoMsg): Pool {
    return Pool.fromAmino(object.value);
  },
  toAminoMsg(message: Pool): PoolAminoMsg {
    return {
      type: "cosmos-sdk/Pool",
      value: Pool.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolProtoMsg): Pool {
    return Pool.decode(message.value);
  },
  toProto(message: Pool): Uint8Array {
    return Pool.encode(message).finish();
  },
  toProtoMsg(message: Pool): PoolProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.Pool",
      value: Pool.encode(message).finish(),
    };
  },
};
export const Cosmos_cryptoPubKey_InterfaceDecoder = (
  input: BinaryReader | Uint8Array
): Any => {
  const reader =
    input instanceof BinaryReader ? input : new BinaryReader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    default:
      return data;
  }
};
export const Cosmos_cryptoPubKey_FromAmino = (content: AnyAmino) => {
  return encodeBech32Pubkey(
    {
      type: "tendermint/PubKeySecp256k1",
      value: toBase64(content.value),
    },
    "cosmos"
  );
};
export const Cosmos_cryptoPubKey_ToAmino = (content: Any) => {
  return {
    typeUrl: "/cosmos.crypto.secp256k1.PubKey",
    value: fromBase64(decodeBech32Pubkey(content).value),
  };
};
