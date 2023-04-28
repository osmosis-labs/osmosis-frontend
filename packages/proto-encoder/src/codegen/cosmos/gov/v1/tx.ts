//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  ClearAdminProposal,
  ClearAdminProposalProtoMsg,
  ClearAdminProposalSDKType,
  ExecuteContractProposal,
  ExecuteContractProposalProtoMsg,
  ExecuteContractProposalSDKType,
  InstantiateContract2Proposal,
  InstantiateContract2ProposalProtoMsg,
  InstantiateContract2ProposalSDKType,
  InstantiateContractProposal,
  InstantiateContractProposalProtoMsg,
  InstantiateContractProposalSDKType,
  MigrateContractProposal,
  MigrateContractProposalProtoMsg,
  MigrateContractProposalSDKType,
  PinCodesProposal,
  PinCodesProposalProtoMsg,
  PinCodesProposalSDKType,
  StoreAndInstantiateContractProposal,
  StoreAndInstantiateContractProposalProtoMsg,
  StoreAndInstantiateContractProposalSDKType,
  StoreCodeProposal,
  StoreCodeProposalProtoMsg,
  StoreCodeProposalSDKType,
  SudoContractProposal,
  SudoContractProposalProtoMsg,
  SudoContractProposalSDKType,
  UnpinCodesProposal,
  UnpinCodesProposalProtoMsg,
  UnpinCodesProposalSDKType,
  UpdateAdminProposal,
  UpdateAdminProposalProtoMsg,
  UpdateAdminProposalSDKType,
  UpdateInstantiateConfigProposal,
  UpdateInstantiateConfigProposalProtoMsg,
  UpdateInstantiateConfigProposalSDKType,
} from "../../../cosmwasm/wasm/v1/proposal";
import {
  Any,
  AnyAmino,
  AnyProtoMsg,
  AnySDKType,
} from "../../../google/protobuf/any";
import { isSet, Long } from "../../../helpers";
import {
  ClientUpdateProposal,
  ClientUpdateProposalProtoMsg,
  ClientUpdateProposalSDKType,
  UpgradeProposal,
  UpgradeProposalProtoMsg,
  UpgradeProposalSDKType,
} from "../../../ibc/core/client/v1/client";
import {
  ReplacePoolIncentivesProposal,
  ReplacePoolIncentivesProposalProtoMsg,
  ReplacePoolIncentivesProposalSDKType,
  UpdatePoolIncentivesProposal,
  UpdatePoolIncentivesProposalProtoMsg,
  UpdatePoolIncentivesProposalSDKType,
} from "../../../osmosis/pool-incentives/v1beta1/gov";
import {
  SetProtoRevAdminAccountProposal,
  SetProtoRevAdminAccountProposalProtoMsg,
  SetProtoRevAdminAccountProposalSDKType,
  SetProtoRevEnabledProposal,
  SetProtoRevEnabledProposalProtoMsg,
  SetProtoRevEnabledProposalSDKType,
} from "../../../osmosis/protorev/v1beta1/gov";
import {
  RemoveSuperfluidAssetsProposal,
  RemoveSuperfluidAssetsProposalProtoMsg,
  RemoveSuperfluidAssetsProposalSDKType,
  SetSuperfluidAssetsProposal,
  SetSuperfluidAssetsProposalProtoMsg,
  SetSuperfluidAssetsProposalSDKType,
  UpdateUnpoolWhiteListProposal,
  UpdateUnpoolWhiteListProposalProtoMsg,
  UpdateUnpoolWhiteListProposalSDKType,
} from "../../../osmosis/superfluid/v1beta1/gov";
import {
  UpdateFeeTokenProposal,
  UpdateFeeTokenProposalProtoMsg,
  UpdateFeeTokenProposalSDKType,
} from "../../../osmosis/txfees/v1beta1/gov";
import { Coin, CoinAmino, CoinSDKType } from "../../base/v1beta1/coin";
import {
  CommunityPoolSpendProposal,
  CommunityPoolSpendProposalProtoMsg,
  CommunityPoolSpendProposalSDKType,
  CommunityPoolSpendProposalWithDeposit,
  CommunityPoolSpendProposalWithDepositProtoMsg,
  CommunityPoolSpendProposalWithDepositSDKType,
} from "../../distribution/v1beta1/distribution";
import {
  ParameterChangeProposal,
  ParameterChangeProposalProtoMsg,
  ParameterChangeProposalSDKType,
} from "../../params/v1beta1/params";
import {
  CancelSoftwareUpgradeProposal,
  CancelSoftwareUpgradeProposalProtoMsg,
  CancelSoftwareUpgradeProposalSDKType,
  SoftwareUpgradeProposal,
  SoftwareUpgradeProposalProtoMsg,
  SoftwareUpgradeProposalSDKType,
} from "../../upgrade/v1beta1/upgrade";
import {
  TextProposal,
  TextProposalProtoMsg,
  TextProposalSDKType,
} from "../v1beta1/gov";
import {
  VoteOption,
  voteOptionFromJSON,
  WeightedVoteOption,
  WeightedVoteOptionAmino,
  WeightedVoteOptionSDKType,
} from "./gov";
/**
 * MsgSubmitProposal defines an sdk.Msg type that supports submitting arbitrary
 * proposal Content.
 */
export interface MsgSubmitProposal {
  messages: Any[];
  initialDeposit: Coin[];
  proposer: string;
  /** metadata is any arbitrary metadata attached to the proposal. */
  metadata: string;
}
export interface MsgSubmitProposalProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgSubmitProposal";
  value: Uint8Array;
}
/**
 * MsgSubmitProposal defines an sdk.Msg type that supports submitting arbitrary
 * proposal Content.
 */
export interface MsgSubmitProposalAmino {
  messages: AnyAmino[];
  initial_deposit: CoinAmino[];
  proposer: string;
  /** metadata is any arbitrary metadata attached to the proposal. */
  metadata: string;
}
export interface MsgSubmitProposalAminoMsg {
  type: "cosmos-sdk/v1/MsgSubmitProposal";
  value: MsgSubmitProposalAmino;
}
/**
 * MsgSubmitProposal defines an sdk.Msg type that supports submitting arbitrary
 * proposal Content.
 */
export interface MsgSubmitProposalSDKType {
  messages: AnySDKType[];
  initial_deposit: CoinSDKType[];
  proposer: string;
  metadata: string;
}
/** MsgSubmitProposalResponse defines the Msg/SubmitProposal response type. */
export interface MsgSubmitProposalResponse {
  proposalId: Long;
}
export interface MsgSubmitProposalResponseProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgSubmitProposalResponse";
  value: Uint8Array;
}
/** MsgSubmitProposalResponse defines the Msg/SubmitProposal response type. */
export interface MsgSubmitProposalResponseAmino {
  proposal_id: string;
}
export interface MsgSubmitProposalResponseAminoMsg {
  type: "cosmos-sdk/v1/MsgSubmitProposalResponse";
  value: MsgSubmitProposalResponseAmino;
}
/** MsgSubmitProposalResponse defines the Msg/SubmitProposal response type. */
export interface MsgSubmitProposalResponseSDKType {
  proposal_id: Long;
}
/**
 * MsgExecLegacyContent is used to wrap the legacy content field into a message.
 * This ensures backwards compatibility with v1beta1.MsgSubmitProposal.
 */
export interface MsgExecLegacyContent {
  /** content is the proposal's content. */
  content?:
    | (ClientUpdateProposal &
        UpgradeProposal &
        StoreCodeProposal &
        InstantiateContractProposal &
        InstantiateContract2Proposal &
        MigrateContractProposal &
        SudoContractProposal &
        ExecuteContractProposal &
        UpdateAdminProposal &
        ClearAdminProposal &
        PinCodesProposal &
        UnpinCodesProposal &
        UpdateInstantiateConfigProposal &
        StoreAndInstantiateContractProposal &
        ReplacePoolIncentivesProposal &
        UpdatePoolIncentivesProposal &
        SetProtoRevEnabledProposal &
        SetProtoRevAdminAccountProposal &
        SetSuperfluidAssetsProposal &
        RemoveSuperfluidAssetsProposal &
        UpdateUnpoolWhiteListProposal &
        UpdateFeeTokenProposal &
        CommunityPoolSpendProposal &
        CommunityPoolSpendProposalWithDeposit &
        TextProposal &
        ParameterChangeProposal &
        SoftwareUpgradeProposal &
        CancelSoftwareUpgradeProposal &
        Any)
    | undefined;
  /** authority must be the gov module address. */
  authority: string;
}
export interface MsgExecLegacyContentProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgExecLegacyContent";
  value: Uint8Array;
}
export type MsgExecLegacyContentEncoded = Omit<
  MsgExecLegacyContent,
  "content"
> & {
  /** content is the proposal's content. */ content?:
    | ClientUpdateProposalProtoMsg
    | UpgradeProposalProtoMsg
    | StoreCodeProposalProtoMsg
    | InstantiateContractProposalProtoMsg
    | InstantiateContract2ProposalProtoMsg
    | MigrateContractProposalProtoMsg
    | SudoContractProposalProtoMsg
    | ExecuteContractProposalProtoMsg
    | UpdateAdminProposalProtoMsg
    | ClearAdminProposalProtoMsg
    | PinCodesProposalProtoMsg
    | UnpinCodesProposalProtoMsg
    | UpdateInstantiateConfigProposalProtoMsg
    | StoreAndInstantiateContractProposalProtoMsg
    | ReplacePoolIncentivesProposalProtoMsg
    | UpdatePoolIncentivesProposalProtoMsg
    | SetProtoRevEnabledProposalProtoMsg
    | SetProtoRevAdminAccountProposalProtoMsg
    | SetSuperfluidAssetsProposalProtoMsg
    | RemoveSuperfluidAssetsProposalProtoMsg
    | UpdateUnpoolWhiteListProposalProtoMsg
    | UpdateFeeTokenProposalProtoMsg
    | CommunityPoolSpendProposalProtoMsg
    | CommunityPoolSpendProposalWithDepositProtoMsg
    | TextProposalProtoMsg
    | ParameterChangeProposalProtoMsg
    | SoftwareUpgradeProposalProtoMsg
    | CancelSoftwareUpgradeProposalProtoMsg
    | AnyProtoMsg
    | undefined;
};
/**
 * MsgExecLegacyContent is used to wrap the legacy content field into a message.
 * This ensures backwards compatibility with v1beta1.MsgSubmitProposal.
 */
export interface MsgExecLegacyContentAmino {
  /** content is the proposal's content. */
  content?: AnyAmino;
  /** authority must be the gov module address. */
  authority: string;
}
export interface MsgExecLegacyContentAminoMsg {
  type: "cosmos-sdk/v1/MsgExecLegacyContent";
  value: MsgExecLegacyContentAmino;
}
/**
 * MsgExecLegacyContent is used to wrap the legacy content field into a message.
 * This ensures backwards compatibility with v1beta1.MsgSubmitProposal.
 */
export interface MsgExecLegacyContentSDKType {
  content?:
    | ClientUpdateProposalSDKType
    | UpgradeProposalSDKType
    | StoreCodeProposalSDKType
    | InstantiateContractProposalSDKType
    | InstantiateContract2ProposalSDKType
    | MigrateContractProposalSDKType
    | SudoContractProposalSDKType
    | ExecuteContractProposalSDKType
    | UpdateAdminProposalSDKType
    | ClearAdminProposalSDKType
    | PinCodesProposalSDKType
    | UnpinCodesProposalSDKType
    | UpdateInstantiateConfigProposalSDKType
    | StoreAndInstantiateContractProposalSDKType
    | ReplacePoolIncentivesProposalSDKType
    | UpdatePoolIncentivesProposalSDKType
    | SetProtoRevEnabledProposalSDKType
    | SetProtoRevAdminAccountProposalSDKType
    | SetSuperfluidAssetsProposalSDKType
    | RemoveSuperfluidAssetsProposalSDKType
    | UpdateUnpoolWhiteListProposalSDKType
    | UpdateFeeTokenProposalSDKType
    | CommunityPoolSpendProposalSDKType
    | CommunityPoolSpendProposalWithDepositSDKType
    | TextProposalSDKType
    | ParameterChangeProposalSDKType
    | SoftwareUpgradeProposalSDKType
    | CancelSoftwareUpgradeProposalSDKType
    | AnySDKType
    | undefined;
  authority: string;
}
/** MsgExecLegacyContentResponse defines the Msg/ExecLegacyContent response type. */
export interface MsgExecLegacyContentResponse {}
export interface MsgExecLegacyContentResponseProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgExecLegacyContentResponse";
  value: Uint8Array;
}
/** MsgExecLegacyContentResponse defines the Msg/ExecLegacyContent response type. */
export interface MsgExecLegacyContentResponseAmino {}
export interface MsgExecLegacyContentResponseAminoMsg {
  type: "cosmos-sdk/v1/MsgExecLegacyContentResponse";
  value: MsgExecLegacyContentResponseAmino;
}
/** MsgExecLegacyContentResponse defines the Msg/ExecLegacyContent response type. */
export interface MsgExecLegacyContentResponseSDKType {}
/** MsgVote defines a message to cast a vote. */
export interface MsgVote {
  proposalId: Long;
  voter: string;
  option: VoteOption;
  metadata: string;
}
export interface MsgVoteProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgVote";
  value: Uint8Array;
}
/** MsgVote defines a message to cast a vote. */
export interface MsgVoteAmino {
  proposal_id: string;
  voter: string;
  option: VoteOption;
  metadata: string;
}
export interface MsgVoteAminoMsg {
  type: "cosmos-sdk/v1/MsgVote";
  value: MsgVoteAmino;
}
/** MsgVote defines a message to cast a vote. */
export interface MsgVoteSDKType {
  proposal_id: Long;
  voter: string;
  option: VoteOption;
  metadata: string;
}
/** MsgVoteResponse defines the Msg/Vote response type. */
export interface MsgVoteResponse {}
export interface MsgVoteResponseProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgVoteResponse";
  value: Uint8Array;
}
/** MsgVoteResponse defines the Msg/Vote response type. */
export interface MsgVoteResponseAmino {}
export interface MsgVoteResponseAminoMsg {
  type: "cosmos-sdk/v1/MsgVoteResponse";
  value: MsgVoteResponseAmino;
}
/** MsgVoteResponse defines the Msg/Vote response type. */
export interface MsgVoteResponseSDKType {}
/** MsgVoteWeighted defines a message to cast a vote. */
export interface MsgVoteWeighted {
  proposalId: Long;
  voter: string;
  options: WeightedVoteOption[];
  metadata: string;
}
export interface MsgVoteWeightedProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgVoteWeighted";
  value: Uint8Array;
}
/** MsgVoteWeighted defines a message to cast a vote. */
export interface MsgVoteWeightedAmino {
  proposal_id: string;
  voter: string;
  options: WeightedVoteOptionAmino[];
  metadata: string;
}
export interface MsgVoteWeightedAminoMsg {
  type: "cosmos-sdk/v1/MsgVoteWeighted";
  value: MsgVoteWeightedAmino;
}
/** MsgVoteWeighted defines a message to cast a vote. */
export interface MsgVoteWeightedSDKType {
  proposal_id: Long;
  voter: string;
  options: WeightedVoteOptionSDKType[];
  metadata: string;
}
/** MsgVoteWeightedResponse defines the Msg/VoteWeighted response type. */
export interface MsgVoteWeightedResponse {}
export interface MsgVoteWeightedResponseProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgVoteWeightedResponse";
  value: Uint8Array;
}
/** MsgVoteWeightedResponse defines the Msg/VoteWeighted response type. */
export interface MsgVoteWeightedResponseAmino {}
export interface MsgVoteWeightedResponseAminoMsg {
  type: "cosmos-sdk/v1/MsgVoteWeightedResponse";
  value: MsgVoteWeightedResponseAmino;
}
/** MsgVoteWeightedResponse defines the Msg/VoteWeighted response type. */
export interface MsgVoteWeightedResponseSDKType {}
/** MsgDeposit defines a message to submit a deposit to an existing proposal. */
export interface MsgDeposit {
  proposalId: Long;
  depositor: string;
  amount: Coin[];
}
export interface MsgDepositProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgDeposit";
  value: Uint8Array;
}
/** MsgDeposit defines a message to submit a deposit to an existing proposal. */
export interface MsgDepositAmino {
  proposal_id: string;
  depositor: string;
  amount: CoinAmino[];
}
export interface MsgDepositAminoMsg {
  type: "cosmos-sdk/v1/MsgDeposit";
  value: MsgDepositAmino;
}
/** MsgDeposit defines a message to submit a deposit to an existing proposal. */
export interface MsgDepositSDKType {
  proposal_id: Long;
  depositor: string;
  amount: CoinSDKType[];
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponse {}
export interface MsgDepositResponseProtoMsg {
  typeUrl: "/cosmos.gov.v1.MsgDepositResponse";
  value: Uint8Array;
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponseAmino {}
export interface MsgDepositResponseAminoMsg {
  type: "cosmos-sdk/v1/MsgDepositResponse";
  value: MsgDepositResponseAmino;
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponseSDKType {}
function createBaseMsgSubmitProposal(): MsgSubmitProposal {
  return {
    messages: [],
    initialDeposit: [],
    proposer: "",
    metadata: "",
  };
}
export const MsgSubmitProposal = {
  typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
  encode(
    message: MsgSubmitProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.messages) {
      Any.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.initialDeposit) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.proposer !== "") {
      writer.uint32(26).string(message.proposer);
    }
    if (message.metadata !== "") {
      writer.uint32(34).string(message.metadata);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSubmitProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubmitProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messages.push(Any.decode(reader, reader.uint32()));
          break;
        case 2:
          message.initialDeposit.push(Coin.decode(reader, reader.uint32()));
          break;
        case 3:
          message.proposer = reader.string();
          break;
        case 4:
          message.metadata = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSubmitProposal>): MsgSubmitProposal {
    const message = createBaseMsgSubmitProposal();
    message.messages = object.messages?.map((e) => Any.fromPartial(e)) || [];
    message.initialDeposit =
      object.initialDeposit?.map((e) => Coin.fromPartial(e)) || [];
    message.proposer = object.proposer ?? "";
    message.metadata = object.metadata ?? "";
    return message;
  },
  fromAmino(object: MsgSubmitProposalAmino): MsgSubmitProposal {
    return {
      messages: Array.isArray(object?.messages)
        ? object.messages.map((e: any) => Any.fromAmino(e))
        : [],
      initialDeposit: Array.isArray(object?.initial_deposit)
        ? object.initial_deposit.map((e: any) => Coin.fromAmino(e))
        : [],
      proposer: object.proposer,
      metadata: object.metadata,
    };
  },
  toAmino(message: MsgSubmitProposal): MsgSubmitProposalAmino {
    const obj: any = {};
    if (message.messages) {
      obj.messages = message.messages.map((e) =>
        e ? Any.toAmino(e) : undefined
      );
    } else {
      obj.messages = [];
    }
    if (message.initialDeposit) {
      obj.initial_deposit = message.initialDeposit.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.initial_deposit = [];
    }
    obj.proposer = message.proposer;
    obj.metadata = message.metadata;
    return obj;
  },
  fromAminoMsg(object: MsgSubmitProposalAminoMsg): MsgSubmitProposal {
    return MsgSubmitProposal.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSubmitProposal): MsgSubmitProposalAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgSubmitProposal",
      value: MsgSubmitProposal.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSubmitProposalProtoMsg): MsgSubmitProposal {
    return MsgSubmitProposal.decode(message.value);
  },
  toProto(message: MsgSubmitProposal): Uint8Array {
    return MsgSubmitProposal.encode(message).finish();
  },
  toProtoMsg(message: MsgSubmitProposal): MsgSubmitProposalProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
      value: MsgSubmitProposal.encode(message).finish(),
    };
  },
};
function createBaseMsgSubmitProposalResponse(): MsgSubmitProposalResponse {
  return {
    proposalId: Long.UZERO,
  };
}
export const MsgSubmitProposalResponse = {
  typeUrl: "/cosmos.gov.v1.MsgSubmitProposalResponse",
  encode(
    message: MsgSubmitProposalResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.proposalId.isZero()) {
      writer.uint32(8).uint64(message.proposalId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSubmitProposalResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubmitProposalResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSubmitProposalResponse>
  ): MsgSubmitProposalResponse {
    const message = createBaseMsgSubmitProposalResponse();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null
        ? Long.fromValue(object.proposalId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MsgSubmitProposalResponseAmino): MsgSubmitProposalResponse {
    return {
      proposalId: Long.fromString(object.proposal_id),
    };
  },
  toAmino(message: MsgSubmitProposalResponse): MsgSubmitProposalResponseAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId
      ? message.proposalId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgSubmitProposalResponseAminoMsg
  ): MsgSubmitProposalResponse {
    return MsgSubmitProposalResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSubmitProposalResponse
  ): MsgSubmitProposalResponseAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgSubmitProposalResponse",
      value: MsgSubmitProposalResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSubmitProposalResponseProtoMsg
  ): MsgSubmitProposalResponse {
    return MsgSubmitProposalResponse.decode(message.value);
  },
  toProto(message: MsgSubmitProposalResponse): Uint8Array {
    return MsgSubmitProposalResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSubmitProposalResponse
  ): MsgSubmitProposalResponseProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgSubmitProposalResponse",
      value: MsgSubmitProposalResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgExecLegacyContent(): MsgExecLegacyContent {
  return {
    content: undefined,
    authority: "",
  };
}
export const MsgExecLegacyContent = {
  typeUrl: "/cosmos.gov.v1.MsgExecLegacyContent",
  encode(
    message: MsgExecLegacyContent,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.content !== undefined) {
      Any.encode(message.content as Any, writer.uint32(10).fork()).ldelim();
    }
    if (message.authority !== "") {
      writer.uint32(18).string(message.authority);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgExecLegacyContent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecLegacyContent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.content = Cosmos_govv1beta1Content_InterfaceDecoder(
            reader
          ) as Any;
          break;
        case 2:
          message.authority = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgExecLegacyContent>): MsgExecLegacyContent {
    const message = createBaseMsgExecLegacyContent();
    message.content =
      object.content !== undefined && object.content !== null
        ? Any.fromPartial(object.content)
        : undefined;
    message.authority = object.authority ?? "";
    return message;
  },
  fromAmino(object: MsgExecLegacyContentAmino): MsgExecLegacyContent {
    return {
      content: object?.content
        ? Cosmos_govv1beta1Content_FromAmino(object.content)
        : undefined,
      authority: object.authority,
    };
  },
  toAmino(message: MsgExecLegacyContent): MsgExecLegacyContentAmino {
    const obj: any = {};
    obj.content = message.content
      ? Cosmos_govv1beta1Content_ToAmino(message.content as Any)
      : undefined;
    obj.authority = message.authority;
    return obj;
  },
  fromAminoMsg(object: MsgExecLegacyContentAminoMsg): MsgExecLegacyContent {
    return MsgExecLegacyContent.fromAmino(object.value);
  },
  toAminoMsg(message: MsgExecLegacyContent): MsgExecLegacyContentAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgExecLegacyContent",
      value: MsgExecLegacyContent.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgExecLegacyContentProtoMsg): MsgExecLegacyContent {
    return MsgExecLegacyContent.decode(message.value);
  },
  toProto(message: MsgExecLegacyContent): Uint8Array {
    return MsgExecLegacyContent.encode(message).finish();
  },
  toProtoMsg(message: MsgExecLegacyContent): MsgExecLegacyContentProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgExecLegacyContent",
      value: MsgExecLegacyContent.encode(message).finish(),
    };
  },
};
function createBaseMsgExecLegacyContentResponse(): MsgExecLegacyContentResponse {
  return {};
}
export const MsgExecLegacyContentResponse = {
  typeUrl: "/cosmos.gov.v1.MsgExecLegacyContentResponse",
  encode(
    _: MsgExecLegacyContentResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgExecLegacyContentResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecLegacyContentResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    _: Partial<MsgExecLegacyContentResponse>
  ): MsgExecLegacyContentResponse {
    const message = createBaseMsgExecLegacyContentResponse();
    return message;
  },
  fromAmino(
    _: MsgExecLegacyContentResponseAmino
  ): MsgExecLegacyContentResponse {
    return {};
  },
  toAmino(_: MsgExecLegacyContentResponse): MsgExecLegacyContentResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgExecLegacyContentResponseAminoMsg
  ): MsgExecLegacyContentResponse {
    return MsgExecLegacyContentResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgExecLegacyContentResponse
  ): MsgExecLegacyContentResponseAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgExecLegacyContentResponse",
      value: MsgExecLegacyContentResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgExecLegacyContentResponseProtoMsg
  ): MsgExecLegacyContentResponse {
    return MsgExecLegacyContentResponse.decode(message.value);
  },
  toProto(message: MsgExecLegacyContentResponse): Uint8Array {
    return MsgExecLegacyContentResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgExecLegacyContentResponse
  ): MsgExecLegacyContentResponseProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgExecLegacyContentResponse",
      value: MsgExecLegacyContentResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgVote(): MsgVote {
  return {
    proposalId: Long.UZERO,
    voter: "",
    option: 0,
    metadata: "",
  };
}
export const MsgVote = {
  typeUrl: "/cosmos.gov.v1.MsgVote",
  encode(
    message: MsgVote,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.proposalId.isZero()) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.voter !== "") {
      writer.uint32(18).string(message.voter);
    }
    if (message.option !== 0) {
      writer.uint32(24).int32(message.option);
    }
    if (message.metadata !== "") {
      writer.uint32(34).string(message.metadata);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgVote {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgVote();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64() as Long;
          break;
        case 2:
          message.voter = reader.string();
          break;
        case 3:
          message.option = reader.int32() as any;
          break;
        case 4:
          message.metadata = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgVote>): MsgVote {
    const message = createBaseMsgVote();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null
        ? Long.fromValue(object.proposalId)
        : Long.UZERO;
    message.voter = object.voter ?? "";
    message.option = object.option ?? 0;
    message.metadata = object.metadata ?? "";
    return message;
  },
  fromAmino(object: MsgVoteAmino): MsgVote {
    return {
      proposalId: Long.fromString(object.proposal_id),
      voter: object.voter,
      option: isSet(object.option) ? voteOptionFromJSON(object.option) : 0,
      metadata: object.metadata,
    };
  },
  toAmino(message: MsgVote): MsgVoteAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId
      ? message.proposalId.toString()
      : undefined;
    obj.voter = message.voter;
    obj.option = message.option;
    obj.metadata = message.metadata;
    return obj;
  },
  fromAminoMsg(object: MsgVoteAminoMsg): MsgVote {
    return MsgVote.fromAmino(object.value);
  },
  toAminoMsg(message: MsgVote): MsgVoteAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgVote",
      value: MsgVote.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgVoteProtoMsg): MsgVote {
    return MsgVote.decode(message.value);
  },
  toProto(message: MsgVote): Uint8Array {
    return MsgVote.encode(message).finish();
  },
  toProtoMsg(message: MsgVote): MsgVoteProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgVote",
      value: MsgVote.encode(message).finish(),
    };
  },
};
function createBaseMsgVoteResponse(): MsgVoteResponse {
  return {};
}
export const MsgVoteResponse = {
  typeUrl: "/cosmos.gov.v1.MsgVoteResponse",
  encode(
    _: MsgVoteResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgVoteResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgVoteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgVoteResponse>): MsgVoteResponse {
    const message = createBaseMsgVoteResponse();
    return message;
  },
  fromAmino(_: MsgVoteResponseAmino): MsgVoteResponse {
    return {};
  },
  toAmino(_: MsgVoteResponse): MsgVoteResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgVoteResponseAminoMsg): MsgVoteResponse {
    return MsgVoteResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgVoteResponse): MsgVoteResponseAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgVoteResponse",
      value: MsgVoteResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgVoteResponseProtoMsg): MsgVoteResponse {
    return MsgVoteResponse.decode(message.value);
  },
  toProto(message: MsgVoteResponse): Uint8Array {
    return MsgVoteResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgVoteResponse): MsgVoteResponseProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgVoteResponse",
      value: MsgVoteResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgVoteWeighted(): MsgVoteWeighted {
  return {
    proposalId: Long.UZERO,
    voter: "",
    options: [],
    metadata: "",
  };
}
export const MsgVoteWeighted = {
  typeUrl: "/cosmos.gov.v1.MsgVoteWeighted",
  encode(
    message: MsgVoteWeighted,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.proposalId.isZero()) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.voter !== "") {
      writer.uint32(18).string(message.voter);
    }
    for (const v of message.options) {
      WeightedVoteOption.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.metadata !== "") {
      writer.uint32(34).string(message.metadata);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgVoteWeighted {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgVoteWeighted();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64() as Long;
          break;
        case 2:
          message.voter = reader.string();
          break;
        case 3:
          message.options.push(
            WeightedVoteOption.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.metadata = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgVoteWeighted>): MsgVoteWeighted {
    const message = createBaseMsgVoteWeighted();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null
        ? Long.fromValue(object.proposalId)
        : Long.UZERO;
    message.voter = object.voter ?? "";
    message.options =
      object.options?.map((e) => WeightedVoteOption.fromPartial(e)) || [];
    message.metadata = object.metadata ?? "";
    return message;
  },
  fromAmino(object: MsgVoteWeightedAmino): MsgVoteWeighted {
    return {
      proposalId: Long.fromString(object.proposal_id),
      voter: object.voter,
      options: Array.isArray(object?.options)
        ? object.options.map((e: any) => WeightedVoteOption.fromAmino(e))
        : [],
      metadata: object.metadata,
    };
  },
  toAmino(message: MsgVoteWeighted): MsgVoteWeightedAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId
      ? message.proposalId.toString()
      : undefined;
    obj.voter = message.voter;
    if (message.options) {
      obj.options = message.options.map((e) =>
        e ? WeightedVoteOption.toAmino(e) : undefined
      );
    } else {
      obj.options = [];
    }
    obj.metadata = message.metadata;
    return obj;
  },
  fromAminoMsg(object: MsgVoteWeightedAminoMsg): MsgVoteWeighted {
    return MsgVoteWeighted.fromAmino(object.value);
  },
  toAminoMsg(message: MsgVoteWeighted): MsgVoteWeightedAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgVoteWeighted",
      value: MsgVoteWeighted.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgVoteWeightedProtoMsg): MsgVoteWeighted {
    return MsgVoteWeighted.decode(message.value);
  },
  toProto(message: MsgVoteWeighted): Uint8Array {
    return MsgVoteWeighted.encode(message).finish();
  },
  toProtoMsg(message: MsgVoteWeighted): MsgVoteWeightedProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgVoteWeighted",
      value: MsgVoteWeighted.encode(message).finish(),
    };
  },
};
function createBaseMsgVoteWeightedResponse(): MsgVoteWeightedResponse {
  return {};
}
export const MsgVoteWeightedResponse = {
  typeUrl: "/cosmos.gov.v1.MsgVoteWeightedResponse",
  encode(
    _: MsgVoteWeightedResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgVoteWeightedResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgVoteWeightedResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgVoteWeightedResponse>): MsgVoteWeightedResponse {
    const message = createBaseMsgVoteWeightedResponse();
    return message;
  },
  fromAmino(_: MsgVoteWeightedResponseAmino): MsgVoteWeightedResponse {
    return {};
  },
  toAmino(_: MsgVoteWeightedResponse): MsgVoteWeightedResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgVoteWeightedResponseAminoMsg
  ): MsgVoteWeightedResponse {
    return MsgVoteWeightedResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgVoteWeightedResponse
  ): MsgVoteWeightedResponseAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgVoteWeightedResponse",
      value: MsgVoteWeightedResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgVoteWeightedResponseProtoMsg
  ): MsgVoteWeightedResponse {
    return MsgVoteWeightedResponse.decode(message.value);
  },
  toProto(message: MsgVoteWeightedResponse): Uint8Array {
    return MsgVoteWeightedResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgVoteWeightedResponse
  ): MsgVoteWeightedResponseProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgVoteWeightedResponse",
      value: MsgVoteWeightedResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDeposit(): MsgDeposit {
  return {
    proposalId: Long.UZERO,
    depositor: "",
    amount: [],
  };
}
export const MsgDeposit = {
  typeUrl: "/cosmos.gov.v1.MsgDeposit",
  encode(
    message: MsgDeposit,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.proposalId.isZero()) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.depositor !== "") {
      writer.uint32(18).string(message.depositor);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDeposit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeposit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64() as Long;
          break;
        case 2:
          message.depositor = reader.string();
          break;
        case 3:
          message.amount.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgDeposit>): MsgDeposit {
    const message = createBaseMsgDeposit();
    message.proposalId =
      object.proposalId !== undefined && object.proposalId !== null
        ? Long.fromValue(object.proposalId)
        : Long.UZERO;
    message.depositor = object.depositor ?? "";
    message.amount = object.amount?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgDepositAmino): MsgDeposit {
    return {
      proposalId: Long.fromString(object.proposal_id),
      depositor: object.depositor,
      amount: Array.isArray(object?.amount)
        ? object.amount.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgDeposit): MsgDepositAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId
      ? message.proposalId.toString()
      : undefined;
    obj.depositor = message.depositor;
    if (message.amount) {
      obj.amount = message.amount.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.amount = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgDepositAminoMsg): MsgDeposit {
    return MsgDeposit.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDeposit): MsgDepositAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgDeposit",
      value: MsgDeposit.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDepositProtoMsg): MsgDeposit {
    return MsgDeposit.decode(message.value);
  },
  toProto(message: MsgDeposit): Uint8Array {
    return MsgDeposit.encode(message).finish();
  },
  toProtoMsg(message: MsgDeposit): MsgDepositProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgDeposit",
      value: MsgDeposit.encode(message).finish(),
    };
  },
};
function createBaseMsgDepositResponse(): MsgDepositResponse {
  return {};
}
export const MsgDepositResponse = {
  typeUrl: "/cosmos.gov.v1.MsgDepositResponse",
  encode(
    _: MsgDepositResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDepositResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDepositResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgDepositResponse>): MsgDepositResponse {
    const message = createBaseMsgDepositResponse();
    return message;
  },
  fromAmino(_: MsgDepositResponseAmino): MsgDepositResponse {
    return {};
  },
  toAmino(_: MsgDepositResponse): MsgDepositResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgDepositResponseAminoMsg): MsgDepositResponse {
    return MsgDepositResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDepositResponse): MsgDepositResponseAminoMsg {
    return {
      type: "cosmos-sdk/v1/MsgDepositResponse",
      value: MsgDepositResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDepositResponseProtoMsg): MsgDepositResponse {
    return MsgDepositResponse.decode(message.value);
  },
  toProto(message: MsgDepositResponse): Uint8Array {
    return MsgDepositResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgDepositResponse): MsgDepositResponseProtoMsg {
    return {
      typeUrl: "/cosmos.gov.v1.MsgDepositResponse",
      value: MsgDepositResponse.encode(message).finish(),
    };
  },
};
export const Cosmos_govv1beta1Content_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
):
  | ClientUpdateProposal
  | UpgradeProposal
  | StoreCodeProposal
  | InstantiateContractProposal
  | InstantiateContract2Proposal
  | MigrateContractProposal
  | SudoContractProposal
  | ExecuteContractProposal
  | UpdateAdminProposal
  | ClearAdminProposal
  | PinCodesProposal
  | UnpinCodesProposal
  | UpdateInstantiateConfigProposal
  | StoreAndInstantiateContractProposal
  | ReplacePoolIncentivesProposal
  | UpdatePoolIncentivesProposal
  | SetProtoRevEnabledProposal
  | SetProtoRevAdminAccountProposal
  | SetSuperfluidAssetsProposal
  | RemoveSuperfluidAssetsProposal
  | UpdateUnpoolWhiteListProposal
  | UpdateFeeTokenProposal
  | CommunityPoolSpendProposal
  | CommunityPoolSpendProposalWithDeposit
  | TextProposal
  | SoftwareUpgradeProposal
  | CancelSoftwareUpgradeProposal
  | Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    case "/ibc.core.client.v1.ClientUpdateProposal":
      return ClientUpdateProposal.decode(data.value);
    case "/ibc.core.client.v1.UpgradeProposal":
      return UpgradeProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.StoreCodeProposal":
      return StoreCodeProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.InstantiateContractProposal":
      return InstantiateContractProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.InstantiateContract2Proposal":
      return InstantiateContract2Proposal.decode(data.value);
    case "/cosmwasm.wasm.v1.MigrateContractProposal":
      return MigrateContractProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.SudoContractProposal":
      return SudoContractProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.ExecuteContractProposal":
      return ExecuteContractProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.UpdateAdminProposal":
      return UpdateAdminProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.ClearAdminProposal":
      return ClearAdminProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.PinCodesProposal":
      return PinCodesProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.UnpinCodesProposal":
      return UnpinCodesProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.UpdateInstantiateConfigProposal":
      return UpdateInstantiateConfigProposal.decode(data.value);
    case "/cosmwasm.wasm.v1.StoreAndInstantiateContractProposal":
      return StoreAndInstantiateContractProposal.decode(data.value);
    case "/osmosis.poolincentives.v1beta1.ReplacePoolIncentivesProposal":
      return ReplacePoolIncentivesProposal.decode(data.value);
    case "/osmosis.poolincentives.v1beta1.UpdatePoolIncentivesProposal":
      return UpdatePoolIncentivesProposal.decode(data.value);
    case "/osmosis.protorev.v1beta1.SetProtoRevEnabledProposal":
      return SetProtoRevEnabledProposal.decode(data.value);
    case "/osmosis.protorev.v1beta1.SetProtoRevAdminAccountProposal":
      return SetProtoRevAdminAccountProposal.decode(data.value);
    case "/osmosis.superfluid.v1beta1.SetSuperfluidAssetsProposal":
      return SetSuperfluidAssetsProposal.decode(data.value);
    case "/osmosis.superfluid.v1beta1.RemoveSuperfluidAssetsProposal":
      return RemoveSuperfluidAssetsProposal.decode(data.value);
    case "/osmosis.superfluid.v1beta1.UpdateUnpoolWhiteListProposal":
      return UpdateUnpoolWhiteListProposal.decode(data.value);
    case "/osmosis.txfees.v1beta1.UpdateFeeTokenProposal":
      return UpdateFeeTokenProposal.decode(data.value);
    case "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal":
      return CommunityPoolSpendProposal.decode(data.value);
    case "/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit":
      return CommunityPoolSpendProposalWithDeposit.decode(data.value);
    case "/cosmos.gov.v1beta1.TextProposal":
      return TextProposal.decode(data.value);
    case "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal":
      return SoftwareUpgradeProposal.decode(data.value);
    case "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal":
      return CancelSoftwareUpgradeProposal.decode(data.value);
    default:
      return data;
  }
};
export const Cosmos_govv1beta1Content_FromAmino = (content: AnyAmino) => {
  switch (content.type) {
    case "cosmos-sdk/ClientUpdateProposal":
      return Any.fromPartial({
        typeUrl: "/ibc.core.client.v1.ClientUpdateProposal",
        value: ClientUpdateProposal.encode(
          ClientUpdateProposal.fromPartial(
            ClientUpdateProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "cosmos-sdk/UpgradeProposal":
      return Any.fromPartial({
        typeUrl: "/ibc.core.client.v1.UpgradeProposal",
        value: UpgradeProposal.encode(
          UpgradeProposal.fromPartial(UpgradeProposal.fromAmino(content.value))
        ).finish(),
      });
    case "wasm/StoreCodeProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.StoreCodeProposal",
        value: StoreCodeProposal.encode(
          StoreCodeProposal.fromPartial(
            StoreCodeProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/InstantiateContractProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.InstantiateContractProposal",
        value: InstantiateContractProposal.encode(
          InstantiateContractProposal.fromPartial(
            InstantiateContractProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/InstantiateContract2Proposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.InstantiateContract2Proposal",
        value: InstantiateContract2Proposal.encode(
          InstantiateContract2Proposal.fromPartial(
            InstantiateContract2Proposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/MigrateContractProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.MigrateContractProposal",
        value: MigrateContractProposal.encode(
          MigrateContractProposal.fromPartial(
            MigrateContractProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/SudoContractProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.SudoContractProposal",
        value: SudoContractProposal.encode(
          SudoContractProposal.fromPartial(
            SudoContractProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/ExecuteContractProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.ExecuteContractProposal",
        value: ExecuteContractProposal.encode(
          ExecuteContractProposal.fromPartial(
            ExecuteContractProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/UpdateAdminProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.UpdateAdminProposal",
        value: UpdateAdminProposal.encode(
          UpdateAdminProposal.fromPartial(
            UpdateAdminProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/ClearAdminProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.ClearAdminProposal",
        value: ClearAdminProposal.encode(
          ClearAdminProposal.fromPartial(
            ClearAdminProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/PinCodesProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.PinCodesProposal",
        value: PinCodesProposal.encode(
          PinCodesProposal.fromPartial(
            PinCodesProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/UnpinCodesProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.UnpinCodesProposal",
        value: UnpinCodesProposal.encode(
          UnpinCodesProposal.fromPartial(
            UnpinCodesProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/UpdateInstantiateConfigProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.UpdateInstantiateConfigProposal",
        value: UpdateInstantiateConfigProposal.encode(
          UpdateInstantiateConfigProposal.fromPartial(
            UpdateInstantiateConfigProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/StoreAndInstantiateContractProposal":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.StoreAndInstantiateContractProposal",
        value: StoreAndInstantiateContractProposal.encode(
          StoreAndInstantiateContractProposal.fromPartial(
            StoreAndInstantiateContractProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "osmosis/poolincentives/replace-pool-incentives-proposal":
      return Any.fromPartial({
        typeUrl:
          "/osmosis.poolincentives.v1beta1.ReplacePoolIncentivesProposal",
        value: ReplacePoolIncentivesProposal.encode(
          ReplacePoolIncentivesProposal.fromPartial(
            ReplacePoolIncentivesProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "osmosis/UpdatePoolIncentivesProposal":
      return Any.fromPartial({
        typeUrl: "/osmosis.poolincentives.v1beta1.UpdatePoolIncentivesProposal",
        value: UpdatePoolIncentivesProposal.encode(
          UpdatePoolIncentivesProposal.fromPartial(
            UpdatePoolIncentivesProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "osmosis/protorev/set-proto-rev-enabled-proposal":
      return Any.fromPartial({
        typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevEnabledProposal",
        value: SetProtoRevEnabledProposal.encode(
          SetProtoRevEnabledProposal.fromPartial(
            SetProtoRevEnabledProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "osmosis/protorev/set-proto-rev-admin-account-proposal":
      return Any.fromPartial({
        typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevAdminAccountProposal",
        value: SetProtoRevAdminAccountProposal.encode(
          SetProtoRevAdminAccountProposal.fromPartial(
            SetProtoRevAdminAccountProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "osmosis/set-superfluid-assets-proposal":
      return Any.fromPartial({
        typeUrl: "/osmosis.superfluid.v1beta1.SetSuperfluidAssetsProposal",
        value: SetSuperfluidAssetsProposal.encode(
          SetSuperfluidAssetsProposal.fromPartial(
            SetSuperfluidAssetsProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "osmosis/del-superfluid-assets-proposal":
      return Any.fromPartial({
        typeUrl: "/osmosis.superfluid.v1beta1.RemoveSuperfluidAssetsProposal",
        value: RemoveSuperfluidAssetsProposal.encode(
          RemoveSuperfluidAssetsProposal.fromPartial(
            RemoveSuperfluidAssetsProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "osmosis/update-unpool-whitelist":
      return Any.fromPartial({
        typeUrl: "/osmosis.superfluid.v1beta1.UpdateUnpoolWhiteListProposal",
        value: UpdateUnpoolWhiteListProposal.encode(
          UpdateUnpoolWhiteListProposal.fromPartial(
            UpdateUnpoolWhiteListProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "osmosis/UpdateFeeTokenProposal":
      return Any.fromPartial({
        typeUrl: "/osmosis.txfees.v1beta1.UpdateFeeTokenProposal",
        value: UpdateFeeTokenProposal.encode(
          UpdateFeeTokenProposal.fromPartial(
            UpdateFeeTokenProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "cosmos-sdk/v1/CommunityPoolSpendProposal":
      return Any.fromPartial({
        typeUrl: "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        value: CommunityPoolSpendProposal.encode(
          CommunityPoolSpendProposal.fromPartial(
            CommunityPoolSpendProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "cosmos-sdk/v1/CommunityPoolSpendProposalWithDeposit":
      return Any.fromPartial({
        typeUrl:
          "/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit",
        value: CommunityPoolSpendProposalWithDeposit.encode(
          CommunityPoolSpendProposalWithDeposit.fromPartial(
            CommunityPoolSpendProposalWithDeposit.fromAmino(content.value)
          )
        ).finish(),
      });
    case "cosmos-sdk/v1/TextProposal":
      return Any.fromPartial({
        typeUrl: "/cosmos.gov.v1beta1.TextProposal",
        value: TextProposal.encode(
          TextProposal.fromPartial(TextProposal.fromAmino(content.value))
        ).finish(),
      });
    case "cosmos-sdk/v1/SoftwareUpgradeProposal":
      return Any.fromPartial({
        typeUrl: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
        value: SoftwareUpgradeProposal.encode(
          SoftwareUpgradeProposal.fromPartial(
            SoftwareUpgradeProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    case "cosmos-sdk/v1/CancelSoftwareUpgradeProposal":
      return Any.fromPartial({
        typeUrl: "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal",
        value: CancelSoftwareUpgradeProposal.encode(
          CancelSoftwareUpgradeProposal.fromPartial(
            CancelSoftwareUpgradeProposal.fromAmino(content.value)
          )
        ).finish(),
      });
    default:
      return Any.fromAmino(content);
  }
};
export const Cosmos_govv1beta1Content_ToAmino = (content: Any) => {
  switch (content.typeUrl) {
    case "/ibc.core.client.v1.ClientUpdateProposal":
      return {
        type: "cosmos-sdk/ClientUpdateProposal",
        value: ClientUpdateProposal.toAmino(
          ClientUpdateProposal.decode(content.value)
        ),
      };
    case "/ibc.core.client.v1.UpgradeProposal":
      return {
        type: "cosmos-sdk/UpgradeProposal",
        value: UpgradeProposal.toAmino(UpgradeProposal.decode(content.value)),
      };
    case "/cosmwasm.wasm.v1.StoreCodeProposal":
      return {
        type: "wasm/StoreCodeProposal",
        value: StoreCodeProposal.toAmino(
          StoreCodeProposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.InstantiateContractProposal":
      return {
        type: "wasm/InstantiateContractProposal",
        value: InstantiateContractProposal.toAmino(
          InstantiateContractProposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.InstantiateContract2Proposal":
      return {
        type: "wasm/InstantiateContract2Proposal",
        value: InstantiateContract2Proposal.toAmino(
          InstantiateContract2Proposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.MigrateContractProposal":
      return {
        type: "wasm/MigrateContractProposal",
        value: MigrateContractProposal.toAmino(
          MigrateContractProposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.SudoContractProposal":
      return {
        type: "wasm/SudoContractProposal",
        value: SudoContractProposal.toAmino(
          SudoContractProposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.ExecuteContractProposal":
      return {
        type: "wasm/ExecuteContractProposal",
        value: ExecuteContractProposal.toAmino(
          ExecuteContractProposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.UpdateAdminProposal":
      return {
        type: "wasm/UpdateAdminProposal",
        value: UpdateAdminProposal.toAmino(
          UpdateAdminProposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.ClearAdminProposal":
      return {
        type: "wasm/ClearAdminProposal",
        value: ClearAdminProposal.toAmino(
          ClearAdminProposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.PinCodesProposal":
      return {
        type: "wasm/PinCodesProposal",
        value: PinCodesProposal.toAmino(PinCodesProposal.decode(content.value)),
      };
    case "/cosmwasm.wasm.v1.UnpinCodesProposal":
      return {
        type: "wasm/UnpinCodesProposal",
        value: UnpinCodesProposal.toAmino(
          UnpinCodesProposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.UpdateInstantiateConfigProposal":
      return {
        type: "wasm/UpdateInstantiateConfigProposal",
        value: UpdateInstantiateConfigProposal.toAmino(
          UpdateInstantiateConfigProposal.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.StoreAndInstantiateContractProposal":
      return {
        type: "wasm/StoreAndInstantiateContractProposal",
        value: StoreAndInstantiateContractProposal.toAmino(
          StoreAndInstantiateContractProposal.decode(content.value)
        ),
      };
    case "/osmosis.poolincentives.v1beta1.ReplacePoolIncentivesProposal":
      return {
        type: "osmosis/poolincentives/replace-pool-incentives-proposal",
        value: ReplacePoolIncentivesProposal.toAmino(
          ReplacePoolIncentivesProposal.decode(content.value)
        ),
      };
    case "/osmosis.poolincentives.v1beta1.UpdatePoolIncentivesProposal":
      return {
        type: "osmosis/UpdatePoolIncentivesProposal",
        value: UpdatePoolIncentivesProposal.toAmino(
          UpdatePoolIncentivesProposal.decode(content.value)
        ),
      };
    case "/osmosis.protorev.v1beta1.SetProtoRevEnabledProposal":
      return {
        type: "osmosis/protorev/set-proto-rev-enabled-proposal",
        value: SetProtoRevEnabledProposal.toAmino(
          SetProtoRevEnabledProposal.decode(content.value)
        ),
      };
    case "/osmosis.protorev.v1beta1.SetProtoRevAdminAccountProposal":
      return {
        type: "osmosis/protorev/set-proto-rev-admin-account-proposal",
        value: SetProtoRevAdminAccountProposal.toAmino(
          SetProtoRevAdminAccountProposal.decode(content.value)
        ),
      };
    case "/osmosis.superfluid.v1beta1.SetSuperfluidAssetsProposal":
      return {
        type: "osmosis/set-superfluid-assets-proposal",
        value: SetSuperfluidAssetsProposal.toAmino(
          SetSuperfluidAssetsProposal.decode(content.value)
        ),
      };
    case "/osmosis.superfluid.v1beta1.RemoveSuperfluidAssetsProposal":
      return {
        type: "osmosis/del-superfluid-assets-proposal",
        value: RemoveSuperfluidAssetsProposal.toAmino(
          RemoveSuperfluidAssetsProposal.decode(content.value)
        ),
      };
    case "/osmosis.superfluid.v1beta1.UpdateUnpoolWhiteListProposal":
      return {
        type: "osmosis/update-unpool-whitelist",
        value: UpdateUnpoolWhiteListProposal.toAmino(
          UpdateUnpoolWhiteListProposal.decode(content.value)
        ),
      };
    case "/osmosis.txfees.v1beta1.UpdateFeeTokenProposal":
      return {
        type: "osmosis/UpdateFeeTokenProposal",
        value: UpdateFeeTokenProposal.toAmino(
          UpdateFeeTokenProposal.decode(content.value)
        ),
      };
    case "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal":
      return {
        type: "cosmos-sdk/v1/CommunityPoolSpendProposal",
        value: CommunityPoolSpendProposal.toAmino(
          CommunityPoolSpendProposal.decode(content.value)
        ),
      };
    case "/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit":
      return {
        type: "cosmos-sdk/v1/CommunityPoolSpendProposalWithDeposit",
        value: CommunityPoolSpendProposalWithDeposit.toAmino(
          CommunityPoolSpendProposalWithDeposit.decode(content.value)
        ),
      };
    case "/cosmos.gov.v1beta1.TextProposal":
      return {
        type: "cosmos-sdk/v1/TextProposal",
        value: TextProposal.toAmino(TextProposal.decode(content.value)),
      };
    case "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal":
      return {
        type: "cosmos-sdk/v1/SoftwareUpgradeProposal",
        value: SoftwareUpgradeProposal.toAmino(
          SoftwareUpgradeProposal.decode(content.value)
        ),
      };
    case "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal":
      return {
        type: "cosmos-sdk/v1/CancelSoftwareUpgradeProposal",
        value: CancelSoftwareUpgradeProposal.toAmino(
          CancelSoftwareUpgradeProposal.decode(content.value)
        ),
      };
    default:
      return Any.toAmino(content);
  }
};
