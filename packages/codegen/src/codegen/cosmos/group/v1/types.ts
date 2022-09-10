import { Timestamp } from "../../../google/protobuf/timestamp";
import { Duration } from "../../../google/protobuf/duration";
import { Any } from "../../../google/protobuf/any";
import * as _m0 from "protobufjs/minimal";
import { toTimestamp, fromTimestamp, isSet, fromJsonTimestamp, DeepPartial, Long } from "@osmonauts/helpers";

/** VoteOption enumerates the valid vote options for a given proposal. */
export enum VoteOption {
  /** VOTE_OPTION_UNSPECIFIED - VOTE_OPTION_UNSPECIFIED defines a no-op vote option. */
  VOTE_OPTION_UNSPECIFIED = 0,

  /** VOTE_OPTION_YES - VOTE_OPTION_YES defines a yes vote option. */
  VOTE_OPTION_YES = 1,

  /** VOTE_OPTION_ABSTAIN - VOTE_OPTION_ABSTAIN defines an abstain vote option. */
  VOTE_OPTION_ABSTAIN = 2,

  /** VOTE_OPTION_NO - VOTE_OPTION_NO defines a no vote option. */
  VOTE_OPTION_NO = 3,

  /** VOTE_OPTION_NO_WITH_VETO - VOTE_OPTION_NO_WITH_VETO defines a no with veto vote option. */
  VOTE_OPTION_NO_WITH_VETO = 4,
  UNRECOGNIZED = -1,
}
export function voteOptionFromJSON(object: any): VoteOption {
  switch (object) {
    case 0:
    case "VOTE_OPTION_UNSPECIFIED":
      return VoteOption.VOTE_OPTION_UNSPECIFIED;

    case 1:
    case "VOTE_OPTION_YES":
      return VoteOption.VOTE_OPTION_YES;

    case 2:
    case "VOTE_OPTION_ABSTAIN":
      return VoteOption.VOTE_OPTION_ABSTAIN;

    case 3:
    case "VOTE_OPTION_NO":
      return VoteOption.VOTE_OPTION_NO;

    case 4:
    case "VOTE_OPTION_NO_WITH_VETO":
      return VoteOption.VOTE_OPTION_NO_WITH_VETO;

    case -1:
    case "UNRECOGNIZED":
    default:
      return VoteOption.UNRECOGNIZED;
  }
}
export function voteOptionToJSON(object: VoteOption): string {
  switch (object) {
    case VoteOption.VOTE_OPTION_UNSPECIFIED:
      return "VOTE_OPTION_UNSPECIFIED";

    case VoteOption.VOTE_OPTION_YES:
      return "VOTE_OPTION_YES";

    case VoteOption.VOTE_OPTION_ABSTAIN:
      return "VOTE_OPTION_ABSTAIN";

    case VoteOption.VOTE_OPTION_NO:
      return "VOTE_OPTION_NO";

    case VoteOption.VOTE_OPTION_NO_WITH_VETO:
      return "VOTE_OPTION_NO_WITH_VETO";

    default:
      return "UNKNOWN";
  }
}

/** ProposalStatus defines proposal statuses. */
export enum ProposalStatus {
  /** PROPOSAL_STATUS_UNSPECIFIED - An empty value is invalid and not allowed. */
  PROPOSAL_STATUS_UNSPECIFIED = 0,

  /** PROPOSAL_STATUS_SUBMITTED - Initial status of a proposal when persisted. */
  PROPOSAL_STATUS_SUBMITTED = 1,

  /** PROPOSAL_STATUS_CLOSED - Final status of a proposal when the final tally was executed. */
  PROPOSAL_STATUS_CLOSED = 2,

  /** PROPOSAL_STATUS_ABORTED - Final status of a proposal when the group was modified before the final tally. */
  PROPOSAL_STATUS_ABORTED = 3,

  /**
   * PROPOSAL_STATUS_WITHDRAWN - A proposal can be deleted before the voting start time by the owner. When this happens the final status
   * is Withdrawn.
   */
  PROPOSAL_STATUS_WITHDRAWN = 4,
  UNRECOGNIZED = -1,
}
export function proposalStatusFromJSON(object: any): ProposalStatus {
  switch (object) {
    case 0:
    case "PROPOSAL_STATUS_UNSPECIFIED":
      return ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED;

    case 1:
    case "PROPOSAL_STATUS_SUBMITTED":
      return ProposalStatus.PROPOSAL_STATUS_SUBMITTED;

    case 2:
    case "PROPOSAL_STATUS_CLOSED":
      return ProposalStatus.PROPOSAL_STATUS_CLOSED;

    case 3:
    case "PROPOSAL_STATUS_ABORTED":
      return ProposalStatus.PROPOSAL_STATUS_ABORTED;

    case 4:
    case "PROPOSAL_STATUS_WITHDRAWN":
      return ProposalStatus.PROPOSAL_STATUS_WITHDRAWN;

    case -1:
    case "UNRECOGNIZED":
    default:
      return ProposalStatus.UNRECOGNIZED;
  }
}
export function proposalStatusToJSON(object: ProposalStatus): string {
  switch (object) {
    case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
      return "PROPOSAL_STATUS_UNSPECIFIED";

    case ProposalStatus.PROPOSAL_STATUS_SUBMITTED:
      return "PROPOSAL_STATUS_SUBMITTED";

    case ProposalStatus.PROPOSAL_STATUS_CLOSED:
      return "PROPOSAL_STATUS_CLOSED";

    case ProposalStatus.PROPOSAL_STATUS_ABORTED:
      return "PROPOSAL_STATUS_ABORTED";

    case ProposalStatus.PROPOSAL_STATUS_WITHDRAWN:
      return "PROPOSAL_STATUS_WITHDRAWN";

    default:
      return "UNKNOWN";
  }
}

/** ProposalResult defines types of proposal results. */
export enum ProposalResult {
  /** PROPOSAL_RESULT_UNSPECIFIED - An empty value is invalid and not allowed */
  PROPOSAL_RESULT_UNSPECIFIED = 0,

  /** PROPOSAL_RESULT_UNFINALIZED - Until a final tally has happened the status is unfinalized */
  PROPOSAL_RESULT_UNFINALIZED = 1,

  /** PROPOSAL_RESULT_ACCEPTED - Final result of the tally */
  PROPOSAL_RESULT_ACCEPTED = 2,

  /** PROPOSAL_RESULT_REJECTED - Final result of the tally */
  PROPOSAL_RESULT_REJECTED = 3,
  UNRECOGNIZED = -1,
}
export function proposalResultFromJSON(object: any): ProposalResult {
  switch (object) {
    case 0:
    case "PROPOSAL_RESULT_UNSPECIFIED":
      return ProposalResult.PROPOSAL_RESULT_UNSPECIFIED;

    case 1:
    case "PROPOSAL_RESULT_UNFINALIZED":
      return ProposalResult.PROPOSAL_RESULT_UNFINALIZED;

    case 2:
    case "PROPOSAL_RESULT_ACCEPTED":
      return ProposalResult.PROPOSAL_RESULT_ACCEPTED;

    case 3:
    case "PROPOSAL_RESULT_REJECTED":
      return ProposalResult.PROPOSAL_RESULT_REJECTED;

    case -1:
    case "UNRECOGNIZED":
    default:
      return ProposalResult.UNRECOGNIZED;
  }
}
export function proposalResultToJSON(object: ProposalResult): string {
  switch (object) {
    case ProposalResult.PROPOSAL_RESULT_UNSPECIFIED:
      return "PROPOSAL_RESULT_UNSPECIFIED";

    case ProposalResult.PROPOSAL_RESULT_UNFINALIZED:
      return "PROPOSAL_RESULT_UNFINALIZED";

    case ProposalResult.PROPOSAL_RESULT_ACCEPTED:
      return "PROPOSAL_RESULT_ACCEPTED";

    case ProposalResult.PROPOSAL_RESULT_REJECTED:
      return "PROPOSAL_RESULT_REJECTED";

    default:
      return "UNKNOWN";
  }
}

/** ProposalExecutorResult defines types of proposal executor results. */
export enum ProposalExecutorResult {
  /** PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED - An empty value is not allowed. */
  PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED = 0,

  /** PROPOSAL_EXECUTOR_RESULT_NOT_RUN - We have not yet run the executor. */
  PROPOSAL_EXECUTOR_RESULT_NOT_RUN = 1,

  /** PROPOSAL_EXECUTOR_RESULT_SUCCESS - The executor was successful and proposed action updated state. */
  PROPOSAL_EXECUTOR_RESULT_SUCCESS = 2,

  /** PROPOSAL_EXECUTOR_RESULT_FAILURE - The executor returned an error and proposed action didn't update state. */
  PROPOSAL_EXECUTOR_RESULT_FAILURE = 3,
  UNRECOGNIZED = -1,
}
export function proposalExecutorResultFromJSON(object: any): ProposalExecutorResult {
  switch (object) {
    case 0:
    case "PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED":
      return ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED;

    case 1:
    case "PROPOSAL_EXECUTOR_RESULT_NOT_RUN":
      return ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN;

    case 2:
    case "PROPOSAL_EXECUTOR_RESULT_SUCCESS":
      return ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_SUCCESS;

    case 3:
    case "PROPOSAL_EXECUTOR_RESULT_FAILURE":
      return ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE;

    case -1:
    case "UNRECOGNIZED":
    default:
      return ProposalExecutorResult.UNRECOGNIZED;
  }
}
export function proposalExecutorResultToJSON(object: ProposalExecutorResult): string {
  switch (object) {
    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED:
      return "PROPOSAL_EXECUTOR_RESULT_UNSPECIFIED";

    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN:
      return "PROPOSAL_EXECUTOR_RESULT_NOT_RUN";

    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_SUCCESS:
      return "PROPOSAL_EXECUTOR_RESULT_SUCCESS";

    case ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE:
      return "PROPOSAL_EXECUTOR_RESULT_FAILURE";

    default:
      return "UNKNOWN";
  }
}

/**
 * Member represents a group member with an account address,
 * non-zero weight and metadata.
 */
export interface Member {
  /** address is the member's account address. */
  address: string;

  /** weight is the member's voting weight that should be greater than 0. */
  weight: string;

  /** metadata is any arbitrary metadata to attached to the member. */
  metadata: string;

  /** added_at is a timestamp specifying when a member was added. */
  addedAt: Date;
}

/** Members defines a repeated slice of Member objects. */
export interface Members {
  /** members is the list of members. */
  members: Member[];
}

/** ThresholdDecisionPolicy implements the DecisionPolicy interface */
export interface ThresholdDecisionPolicy {
  /** threshold is the minimum weighted sum of yes votes that must be met or exceeded for a proposal to succeed. */
  threshold: string;

  /** windows defines the different windows for voting and execution. */
  windows: DecisionPolicyWindows;
}

/** PercentageDecisionPolicy implements the DecisionPolicy interface */
export interface PercentageDecisionPolicy {
  /** percentage is the minimum percentage the weighted sum of yes votes must meet for a proposal to succeed. */
  percentage: string;

  /** windows defines the different windows for voting and execution. */
  windows: DecisionPolicyWindows;
}

/** DecisionPolicyWindows defines the different windows for voting and execution. */
export interface DecisionPolicyWindows {
  /**
   * voting_period is the duration from submission of a proposal to the end of voting period
   * Within this times votes can be submitted with MsgVote.
   */
  votingPeriod: Duration;

  /**
   * min_execution_period is the minimum duration after the proposal submission
   * where members can start sending MsgExec. This means that the window for
   * sending a MsgExec transaction is:
   * `[ submission + min_execution_period ; submission + voting_period + max_execution_period]`
   * where max_execution_period is a app-specific config, defined in the keeper.
   * If not set, min_execution_period will default to 0.
   * 
   * Please make sure to set a `min_execution_period` that is smaller than
   * `voting_period + max_execution_period`, or else the above execution window
   * is empty, meaning that all proposals created with this decision policy
   * won't be able to be executed.
   */
  minExecutionPeriod: Duration;
}

/** GroupInfo represents the high-level on-chain information for a group. */
export interface GroupInfo {
  /** id is the unique ID of the group. */
  id: Long;

  /** admin is the account address of the group's admin. */
  admin: string;

  /** metadata is any arbitrary metadata to attached to the group. */
  metadata: string;

  /**
   * version is used to track changes to a group's membership structure that
   * would break existing proposals. Whenever any members weight is changed,
   * or any member is added or removed this version is incremented and will
   * cause proposals based on older versions of this group to fail
   */
  version: Long;

  /** total_weight is the sum of the group members' weights. */
  totalWeight: string;

  /** created_at is a timestamp specifying when a group was created. */
  createdAt: Date;
}

/** GroupMember represents the relationship between a group and a member. */
export interface GroupMember {
  /** group_id is the unique ID of the group. */
  groupId: Long;

  /** member is the member data. */
  member: Member;
}

/** GroupPolicyInfo represents the high-level on-chain information for a group policy. */
export interface GroupPolicyInfo {
  /** address is the account address of group policy. */
  address: string;

  /** group_id is the unique ID of the group. */
  groupId: Long;

  /** admin is the account address of the group admin. */
  admin: string;

  /** metadata is any arbitrary metadata to attached to the group policy. */
  metadata: string;

  /**
   * version is used to track changes to a group's GroupPolicyInfo structure that
   * would create a different result on a running proposal.
   */
  version: Long;

  /** decision_policy specifies the group policy's decision policy. */
  decisionPolicy: Any;

  /** created_at is a timestamp specifying when a group policy was created. */
  createdAt: Date;
}

/**
 * Proposal defines a group proposal. Any member of a group can submit a proposal
 * for a group policy to decide upon.
 * A proposal consists of a set of `sdk.Msg`s that will be executed if the proposal
 * passes as well as some optional metadata associated with the proposal.
 */
export interface Proposal {
  /** id is the unique id of the proposal. */
  id: Long;

  /** address is the account address of group policy. */
  address: string;

  /** metadata is any arbitrary metadata to attached to the proposal. */
  metadata: string;

  /** proposers are the account addresses of the proposers. */
  proposers: string[];

  /** submit_time is a timestamp specifying when a proposal was submitted. */
  submitTime: Date;

  /**
   * group_version tracks the version of the group that this proposal corresponds to.
   * When group membership is changed, existing proposals from previous group versions will become invalid.
   */
  groupVersion: Long;

  /**
   * group_policy_version tracks the version of the group policy that this proposal corresponds to.
   * When a decision policy is changed, existing proposals from previous policy versions will become invalid.
   */
  groupPolicyVersion: Long;

  /** status represents the high level position in the life cycle of the proposal. Initial value is Submitted. */
  status: ProposalStatus;

  /**
   * result is the final result based on the votes and election rule. Initial value is unfinalized.
   * The result is persisted so that clients can always rely on this state and not have to replicate the logic.
   */
  result: ProposalResult;

  /**
   * final_tally_result contains the sums of all weighted votes for this
   * proposal for each vote option, after tallying. When querying a proposal
   * via gRPC, this field is not populated until the proposal's voting period
   * has ended.
   */
  finalTallyResult: TallyResult;

  /**
   * voting_period_end is the timestamp before which voting must be done.
   * Unless a successfull MsgExec is called before (to execute a proposal whose
   * tally is successful before the voting period ends), tallying will be done
   * at this point, and the `final_tally_result`, as well
   * as `status` and `result` fields will be accordingly updated.
   */
  votingPeriodEnd: Date;

  /** executor_result is the final result based on the votes and election rule. Initial value is NotRun. */
  executorResult: ProposalExecutorResult;

  /** messages is a list of Msgs that will be executed if the proposal passes. */
  messages: Any[];
}

/** TallyResult represents the sum of weighted votes for each vote option. */
export interface TallyResult {
  /** yes_count is the weighted sum of yes votes. */
  yesCount: string;

  /** abstain_count is the weighted sum of abstainers. */
  abstainCount: string;

  /** no is the weighted sum of no votes. */
  noCount: string;

  /** no_with_veto_count is the weighted sum of veto. */
  noWithVetoCount: string;
}

/** Vote represents a vote for a proposal. */
export interface Vote {
  /** proposal is the unique ID of the proposal. */
  proposalId: Long;

  /** voter is the account address of the voter. */
  voter: string;

  /** option is the voter's choice on the proposal. */
  option: VoteOption;

  /** metadata is any arbitrary metadata to attached to the vote. */
  metadata: string;

  /** submit_time is the timestamp when the vote was submitted. */
  submitTime: Date;
}

function createBaseMember(): Member {
  return {
    address: "",
    weight: "",
    metadata: "",
    addedAt: undefined
  };
}

export const Member = {
  encode(message: Member, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }

    if (message.weight !== "") {
      writer.uint32(18).string(message.weight);
    }

    if (message.metadata !== "") {
      writer.uint32(26).string(message.metadata);
    }

    if (message.addedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.addedAt), writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Member {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMember();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;

        case 2:
          message.weight = reader.string();
          break;

        case 3:
          message.metadata = reader.string();
          break;

        case 4:
          message.addedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Member {
    return {
      address: isSet(object.address) ? String(object.address) : "",
      weight: isSet(object.weight) ? String(object.weight) : "",
      metadata: isSet(object.metadata) ? String(object.metadata) : "",
      addedAt: isSet(object.addedAt) ? fromJsonTimestamp(object.addedAt) : undefined
    };
  },

  toJSON(message: Member): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.weight !== undefined && (obj.weight = message.weight);
    message.metadata !== undefined && (obj.metadata = message.metadata);
    message.addedAt !== undefined && (obj.addedAt = message.addedAt.toISOString());
    return obj;
  },

  fromPartial(object: DeepPartial<Member>): Member {
    const message = createBaseMember();
    message.address = object.address ?? "";
    message.weight = object.weight ?? "";
    message.metadata = object.metadata ?? "";
    message.addedAt = object.addedAt ?? undefined;
    return message;
  }

};

function createBaseMembers(): Members {
  return {
    members: []
  };
}

export const Members = {
  encode(message: Members, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.members) {
      Member.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Members {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMembers();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.members.push(Member.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Members {
    return {
      members: Array.isArray(object?.members) ? object.members.map((e: any) => Member.fromJSON(e)) : []
    };
  },

  toJSON(message: Members): unknown {
    const obj: any = {};

    if (message.members) {
      obj.members = message.members.map(e => e ? Member.toJSON(e) : undefined);
    } else {
      obj.members = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<Members>): Members {
    const message = createBaseMembers();
    message.members = object.members?.map(e => Member.fromPartial(e)) || [];
    return message;
  }

};

function createBaseThresholdDecisionPolicy(): ThresholdDecisionPolicy {
  return {
    threshold: "",
    windows: undefined
  };
}

export const ThresholdDecisionPolicy = {
  encode(message: ThresholdDecisionPolicy, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.threshold !== "") {
      writer.uint32(10).string(message.threshold);
    }

    if (message.windows !== undefined) {
      DecisionPolicyWindows.encode(message.windows, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ThresholdDecisionPolicy {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseThresholdDecisionPolicy();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.threshold = reader.string();
          break;

        case 2:
          message.windows = DecisionPolicyWindows.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ThresholdDecisionPolicy {
    return {
      threshold: isSet(object.threshold) ? String(object.threshold) : "",
      windows: isSet(object.windows) ? DecisionPolicyWindows.fromJSON(object.windows) : undefined
    };
  },

  toJSON(message: ThresholdDecisionPolicy): unknown {
    const obj: any = {};
    message.threshold !== undefined && (obj.threshold = message.threshold);
    message.windows !== undefined && (obj.windows = message.windows ? DecisionPolicyWindows.toJSON(message.windows) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<ThresholdDecisionPolicy>): ThresholdDecisionPolicy {
    const message = createBaseThresholdDecisionPolicy();
    message.threshold = object.threshold ?? "";
    message.windows = object.windows !== undefined && object.windows !== null ? DecisionPolicyWindows.fromPartial(object.windows) : undefined;
    return message;
  }

};

function createBasePercentageDecisionPolicy(): PercentageDecisionPolicy {
  return {
    percentage: "",
    windows: undefined
  };
}

export const PercentageDecisionPolicy = {
  encode(message: PercentageDecisionPolicy, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.percentage !== "") {
      writer.uint32(10).string(message.percentage);
    }

    if (message.windows !== undefined) {
      DecisionPolicyWindows.encode(message.windows, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PercentageDecisionPolicy {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePercentageDecisionPolicy();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.percentage = reader.string();
          break;

        case 2:
          message.windows = DecisionPolicyWindows.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): PercentageDecisionPolicy {
    return {
      percentage: isSet(object.percentage) ? String(object.percentage) : "",
      windows: isSet(object.windows) ? DecisionPolicyWindows.fromJSON(object.windows) : undefined
    };
  },

  toJSON(message: PercentageDecisionPolicy): unknown {
    const obj: any = {};
    message.percentage !== undefined && (obj.percentage = message.percentage);
    message.windows !== undefined && (obj.windows = message.windows ? DecisionPolicyWindows.toJSON(message.windows) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<PercentageDecisionPolicy>): PercentageDecisionPolicy {
    const message = createBasePercentageDecisionPolicy();
    message.percentage = object.percentage ?? "";
    message.windows = object.windows !== undefined && object.windows !== null ? DecisionPolicyWindows.fromPartial(object.windows) : undefined;
    return message;
  }

};

function createBaseDecisionPolicyWindows(): DecisionPolicyWindows {
  return {
    votingPeriod: undefined,
    minExecutionPeriod: undefined
  };
}

export const DecisionPolicyWindows = {
  encode(message: DecisionPolicyWindows, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.votingPeriod !== undefined) {
      Duration.encode(message.votingPeriod, writer.uint32(10).fork()).ldelim();
    }

    if (message.minExecutionPeriod !== undefined) {
      Duration.encode(message.minExecutionPeriod, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DecisionPolicyWindows {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDecisionPolicyWindows();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.votingPeriod = Duration.decode(reader, reader.uint32());
          break;

        case 2:
          message.minExecutionPeriod = Duration.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): DecisionPolicyWindows {
    return {
      votingPeriod: isSet(object.votingPeriod) ? Duration.fromJSON(object.votingPeriod) : undefined,
      minExecutionPeriod: isSet(object.minExecutionPeriod) ? Duration.fromJSON(object.minExecutionPeriod) : undefined
    };
  },

  toJSON(message: DecisionPolicyWindows): unknown {
    const obj: any = {};
    message.votingPeriod !== undefined && (obj.votingPeriod = message.votingPeriod);
    message.minExecutionPeriod !== undefined && (obj.minExecutionPeriod = message.minExecutionPeriod);
    return obj;
  },

  fromPartial(object: DeepPartial<DecisionPolicyWindows>): DecisionPolicyWindows {
    const message = createBaseDecisionPolicyWindows();
    message.votingPeriod = object.votingPeriod ?? undefined;
    message.minExecutionPeriod = object.minExecutionPeriod ?? undefined;
    return message;
  }

};

function createBaseGroupInfo(): GroupInfo {
  return {
    id: Long.UZERO,
    admin: "",
    metadata: "",
    version: Long.UZERO,
    totalWeight: "",
    createdAt: undefined
  };
}

export const GroupInfo = {
  encode(message: GroupInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.id.isZero()) {
      writer.uint32(8).uint64(message.id);
    }

    if (message.admin !== "") {
      writer.uint32(18).string(message.admin);
    }

    if (message.metadata !== "") {
      writer.uint32(26).string(message.metadata);
    }

    if (!message.version.isZero()) {
      writer.uint32(32).uint64(message.version);
    }

    if (message.totalWeight !== "") {
      writer.uint32(42).string(message.totalWeight);
    }

    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(50).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GroupInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroupInfo();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.id = (reader.uint64() as Long);
          break;

        case 2:
          message.admin = reader.string();
          break;

        case 3:
          message.metadata = reader.string();
          break;

        case 4:
          message.version = (reader.uint64() as Long);
          break;

        case 5:
          message.totalWeight = reader.string();
          break;

        case 6:
          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): GroupInfo {
    return {
      id: isSet(object.id) ? Long.fromString(object.id) : Long.UZERO,
      admin: isSet(object.admin) ? String(object.admin) : "",
      metadata: isSet(object.metadata) ? String(object.metadata) : "",
      version: isSet(object.version) ? Long.fromString(object.version) : Long.UZERO,
      totalWeight: isSet(object.totalWeight) ? String(object.totalWeight) : "",
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined
    };
  },

  toJSON(message: GroupInfo): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = (message.id || Long.UZERO).toString());
    message.admin !== undefined && (obj.admin = message.admin);
    message.metadata !== undefined && (obj.metadata = message.metadata);
    message.version !== undefined && (obj.version = (message.version || Long.UZERO).toString());
    message.totalWeight !== undefined && (obj.totalWeight = message.totalWeight);
    message.createdAt !== undefined && (obj.createdAt = message.createdAt.toISOString());
    return obj;
  },

  fromPartial(object: DeepPartial<GroupInfo>): GroupInfo {
    const message = createBaseGroupInfo();
    message.id = object.id !== undefined && object.id !== null ? Long.fromValue(object.id) : Long.UZERO;
    message.admin = object.admin ?? "";
    message.metadata = object.metadata ?? "";
    message.version = object.version !== undefined && object.version !== null ? Long.fromValue(object.version) : Long.UZERO;
    message.totalWeight = object.totalWeight ?? "";
    message.createdAt = object.createdAt ?? undefined;
    return message;
  }

};

function createBaseGroupMember(): GroupMember {
  return {
    groupId: Long.UZERO,
    member: undefined
  };
}

export const GroupMember = {
  encode(message: GroupMember, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.groupId.isZero()) {
      writer.uint32(8).uint64(message.groupId);
    }

    if (message.member !== undefined) {
      Member.encode(message.member, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GroupMember {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroupMember();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.groupId = (reader.uint64() as Long);
          break;

        case 2:
          message.member = Member.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): GroupMember {
    return {
      groupId: isSet(object.groupId) ? Long.fromString(object.groupId) : Long.UZERO,
      member: isSet(object.member) ? Member.fromJSON(object.member) : undefined
    };
  },

  toJSON(message: GroupMember): unknown {
    const obj: any = {};
    message.groupId !== undefined && (obj.groupId = (message.groupId || Long.UZERO).toString());
    message.member !== undefined && (obj.member = message.member ? Member.toJSON(message.member) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<GroupMember>): GroupMember {
    const message = createBaseGroupMember();
    message.groupId = object.groupId !== undefined && object.groupId !== null ? Long.fromValue(object.groupId) : Long.UZERO;
    message.member = object.member !== undefined && object.member !== null ? Member.fromPartial(object.member) : undefined;
    return message;
  }

};

function createBaseGroupPolicyInfo(): GroupPolicyInfo {
  return {
    address: "",
    groupId: Long.UZERO,
    admin: "",
    metadata: "",
    version: Long.UZERO,
    decisionPolicy: undefined,
    createdAt: undefined
  };
}

export const GroupPolicyInfo = {
  encode(message: GroupPolicyInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }

    if (!message.groupId.isZero()) {
      writer.uint32(16).uint64(message.groupId);
    }

    if (message.admin !== "") {
      writer.uint32(26).string(message.admin);
    }

    if (message.metadata !== "") {
      writer.uint32(34).string(message.metadata);
    }

    if (!message.version.isZero()) {
      writer.uint32(40).uint64(message.version);
    }

    if (message.decisionPolicy !== undefined) {
      Any.encode(message.decisionPolicy, writer.uint32(50).fork()).ldelim();
    }

    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(58).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GroupPolicyInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroupPolicyInfo();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;

        case 2:
          message.groupId = (reader.uint64() as Long);
          break;

        case 3:
          message.admin = reader.string();
          break;

        case 4:
          message.metadata = reader.string();
          break;

        case 5:
          message.version = (reader.uint64() as Long);
          break;

        case 6:
          message.decisionPolicy = Any.decode(reader, reader.uint32());
          break;

        case 7:
          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): GroupPolicyInfo {
    return {
      address: isSet(object.address) ? String(object.address) : "",
      groupId: isSet(object.groupId) ? Long.fromString(object.groupId) : Long.UZERO,
      admin: isSet(object.admin) ? String(object.admin) : "",
      metadata: isSet(object.metadata) ? String(object.metadata) : "",
      version: isSet(object.version) ? Long.fromString(object.version) : Long.UZERO,
      decisionPolicy: isSet(object.decisionPolicy) ? Any.fromJSON(object.decisionPolicy) : undefined,
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined
    };
  },

  toJSON(message: GroupPolicyInfo): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = message.address);
    message.groupId !== undefined && (obj.groupId = (message.groupId || Long.UZERO).toString());
    message.admin !== undefined && (obj.admin = message.admin);
    message.metadata !== undefined && (obj.metadata = message.metadata);
    message.version !== undefined && (obj.version = (message.version || Long.UZERO).toString());
    message.decisionPolicy !== undefined && (obj.decisionPolicy = message.decisionPolicy ? Any.toJSON(message.decisionPolicy) : undefined);
    message.createdAt !== undefined && (obj.createdAt = message.createdAt.toISOString());
    return obj;
  },

  fromPartial(object: DeepPartial<GroupPolicyInfo>): GroupPolicyInfo {
    const message = createBaseGroupPolicyInfo();
    message.address = object.address ?? "";
    message.groupId = object.groupId !== undefined && object.groupId !== null ? Long.fromValue(object.groupId) : Long.UZERO;
    message.admin = object.admin ?? "";
    message.metadata = object.metadata ?? "";
    message.version = object.version !== undefined && object.version !== null ? Long.fromValue(object.version) : Long.UZERO;
    message.decisionPolicy = object.decisionPolicy !== undefined && object.decisionPolicy !== null ? Any.fromPartial(object.decisionPolicy) : undefined;
    message.createdAt = object.createdAt ?? undefined;
    return message;
  }

};

function createBaseProposal(): Proposal {
  return {
    id: Long.UZERO,
    address: "",
    metadata: "",
    proposers: [],
    submitTime: undefined,
    groupVersion: Long.UZERO,
    groupPolicyVersion: Long.UZERO,
    status: 0,
    result: 0,
    finalTallyResult: undefined,
    votingPeriodEnd: undefined,
    executorResult: 0,
    messages: []
  };
}

export const Proposal = {
  encode(message: Proposal, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.id.isZero()) {
      writer.uint32(8).uint64(message.id);
    }

    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }

    if (message.metadata !== "") {
      writer.uint32(26).string(message.metadata);
    }

    for (const v of message.proposers) {
      writer.uint32(34).string(v!);
    }

    if (message.submitTime !== undefined) {
      Timestamp.encode(toTimestamp(message.submitTime), writer.uint32(42).fork()).ldelim();
    }

    if (!message.groupVersion.isZero()) {
      writer.uint32(48).uint64(message.groupVersion);
    }

    if (!message.groupPolicyVersion.isZero()) {
      writer.uint32(56).uint64(message.groupPolicyVersion);
    }

    if (message.status !== 0) {
      writer.uint32(64).int32(message.status);
    }

    if (message.result !== 0) {
      writer.uint32(72).int32(message.result);
    }

    if (message.finalTallyResult !== undefined) {
      TallyResult.encode(message.finalTallyResult, writer.uint32(82).fork()).ldelim();
    }

    if (message.votingPeriodEnd !== undefined) {
      Timestamp.encode(toTimestamp(message.votingPeriodEnd), writer.uint32(90).fork()).ldelim();
    }

    if (message.executorResult !== 0) {
      writer.uint32(96).int32(message.executorResult);
    }

    for (const v of message.messages) {
      Any.encode(v!, writer.uint32(106).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Proposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProposal();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.id = (reader.uint64() as Long);
          break;

        case 2:
          message.address = reader.string();
          break;

        case 3:
          message.metadata = reader.string();
          break;

        case 4:
          message.proposers.push(reader.string());
          break;

        case 5:
          message.submitTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        case 6:
          message.groupVersion = (reader.uint64() as Long);
          break;

        case 7:
          message.groupPolicyVersion = (reader.uint64() as Long);
          break;

        case 8:
          message.status = (reader.int32() as any);
          break;

        case 9:
          message.result = (reader.int32() as any);
          break;

        case 10:
          message.finalTallyResult = TallyResult.decode(reader, reader.uint32());
          break;

        case 11:
          message.votingPeriodEnd = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        case 12:
          message.executorResult = (reader.int32() as any);
          break;

        case 13:
          message.messages.push(Any.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Proposal {
    return {
      id: isSet(object.id) ? Long.fromString(object.id) : Long.UZERO,
      address: isSet(object.address) ? String(object.address) : "",
      metadata: isSet(object.metadata) ? String(object.metadata) : "",
      proposers: Array.isArray(object?.proposers) ? object.proposers.map((e: any) => String(e)) : [],
      submitTime: isSet(object.submitTime) ? fromJsonTimestamp(object.submitTime) : undefined,
      groupVersion: isSet(object.groupVersion) ? Long.fromString(object.groupVersion) : Long.UZERO,
      groupPolicyVersion: isSet(object.groupPolicyVersion) ? Long.fromString(object.groupPolicyVersion) : Long.UZERO,
      status: isSet(object.status) ? proposalStatusFromJSON(object.status) : 0,
      result: isSet(object.result) ? proposalResultFromJSON(object.result) : 0,
      finalTallyResult: isSet(object.finalTallyResult) ? TallyResult.fromJSON(object.finalTallyResult) : undefined,
      votingPeriodEnd: isSet(object.votingPeriodEnd) ? fromJsonTimestamp(object.votingPeriodEnd) : undefined,
      executorResult: isSet(object.executorResult) ? proposalExecutorResultFromJSON(object.executorResult) : 0,
      messages: Array.isArray(object?.messages) ? object.messages.map((e: any) => Any.fromJSON(e)) : []
    };
  },

  toJSON(message: Proposal): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = (message.id || Long.UZERO).toString());
    message.address !== undefined && (obj.address = message.address);
    message.metadata !== undefined && (obj.metadata = message.metadata);

    if (message.proposers) {
      obj.proposers = message.proposers.map(e => e);
    } else {
      obj.proposers = [];
    }

    message.submitTime !== undefined && (obj.submitTime = message.submitTime.toISOString());
    message.groupVersion !== undefined && (obj.groupVersion = (message.groupVersion || Long.UZERO).toString());
    message.groupPolicyVersion !== undefined && (obj.groupPolicyVersion = (message.groupPolicyVersion || Long.UZERO).toString());
    message.status !== undefined && (obj.status = proposalStatusToJSON(message.status));
    message.result !== undefined && (obj.result = proposalResultToJSON(message.result));
    message.finalTallyResult !== undefined && (obj.finalTallyResult = message.finalTallyResult ? TallyResult.toJSON(message.finalTallyResult) : undefined);
    message.votingPeriodEnd !== undefined && (obj.votingPeriodEnd = message.votingPeriodEnd.toISOString());
    message.executorResult !== undefined && (obj.executorResult = proposalExecutorResultToJSON(message.executorResult));

    if (message.messages) {
      obj.messages = message.messages.map(e => e ? Any.toJSON(e) : undefined);
    } else {
      obj.messages = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<Proposal>): Proposal {
    const message = createBaseProposal();
    message.id = object.id !== undefined && object.id !== null ? Long.fromValue(object.id) : Long.UZERO;
    message.address = object.address ?? "";
    message.metadata = object.metadata ?? "";
    message.proposers = object.proposers?.map(e => e) || [];
    message.submitTime = object.submitTime ?? undefined;
    message.groupVersion = object.groupVersion !== undefined && object.groupVersion !== null ? Long.fromValue(object.groupVersion) : Long.UZERO;
    message.groupPolicyVersion = object.groupPolicyVersion !== undefined && object.groupPolicyVersion !== null ? Long.fromValue(object.groupPolicyVersion) : Long.UZERO;
    message.status = object.status ?? 0;
    message.result = object.result ?? 0;
    message.finalTallyResult = object.finalTallyResult !== undefined && object.finalTallyResult !== null ? TallyResult.fromPartial(object.finalTallyResult) : undefined;
    message.votingPeriodEnd = object.votingPeriodEnd ?? undefined;
    message.executorResult = object.executorResult ?? 0;
    message.messages = object.messages?.map(e => Any.fromPartial(e)) || [];
    return message;
  }

};

function createBaseTallyResult(): TallyResult {
  return {
    yesCount: "",
    abstainCount: "",
    noCount: "",
    noWithVetoCount: ""
  };
}

export const TallyResult = {
  encode(message: TallyResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.yesCount !== "") {
      writer.uint32(10).string(message.yesCount);
    }

    if (message.abstainCount !== "") {
      writer.uint32(18).string(message.abstainCount);
    }

    if (message.noCount !== "") {
      writer.uint32(26).string(message.noCount);
    }

    if (message.noWithVetoCount !== "") {
      writer.uint32(34).string(message.noWithVetoCount);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TallyResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTallyResult();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.yesCount = reader.string();
          break;

        case 2:
          message.abstainCount = reader.string();
          break;

        case 3:
          message.noCount = reader.string();
          break;

        case 4:
          message.noWithVetoCount = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): TallyResult {
    return {
      yesCount: isSet(object.yesCount) ? String(object.yesCount) : "",
      abstainCount: isSet(object.abstainCount) ? String(object.abstainCount) : "",
      noCount: isSet(object.noCount) ? String(object.noCount) : "",
      noWithVetoCount: isSet(object.noWithVetoCount) ? String(object.noWithVetoCount) : ""
    };
  },

  toJSON(message: TallyResult): unknown {
    const obj: any = {};
    message.yesCount !== undefined && (obj.yesCount = message.yesCount);
    message.abstainCount !== undefined && (obj.abstainCount = message.abstainCount);
    message.noCount !== undefined && (obj.noCount = message.noCount);
    message.noWithVetoCount !== undefined && (obj.noWithVetoCount = message.noWithVetoCount);
    return obj;
  },

  fromPartial(object: DeepPartial<TallyResult>): TallyResult {
    const message = createBaseTallyResult();
    message.yesCount = object.yesCount ?? "";
    message.abstainCount = object.abstainCount ?? "";
    message.noCount = object.noCount ?? "";
    message.noWithVetoCount = object.noWithVetoCount ?? "";
    return message;
  }

};

function createBaseVote(): Vote {
  return {
    proposalId: Long.UZERO,
    voter: "",
    option: 0,
    metadata: "",
    submitTime: undefined
  };
}

export const Vote = {
  encode(message: Vote, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

    if (message.submitTime !== undefined) {
      Timestamp.encode(toTimestamp(message.submitTime), writer.uint32(42).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Vote {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVote();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.proposalId = (reader.uint64() as Long);
          break;

        case 2:
          message.voter = reader.string();
          break;

        case 3:
          message.option = (reader.int32() as any);
          break;

        case 4:
          message.metadata = reader.string();
          break;

        case 5:
          message.submitTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Vote {
    return {
      proposalId: isSet(object.proposalId) ? Long.fromString(object.proposalId) : Long.UZERO,
      voter: isSet(object.voter) ? String(object.voter) : "",
      option: isSet(object.option) ? voteOptionFromJSON(object.option) : 0,
      metadata: isSet(object.metadata) ? String(object.metadata) : "",
      submitTime: isSet(object.submitTime) ? fromJsonTimestamp(object.submitTime) : undefined
    };
  },

  toJSON(message: Vote): unknown {
    const obj: any = {};
    message.proposalId !== undefined && (obj.proposalId = (message.proposalId || Long.UZERO).toString());
    message.voter !== undefined && (obj.voter = message.voter);
    message.option !== undefined && (obj.option = voteOptionToJSON(message.option));
    message.metadata !== undefined && (obj.metadata = message.metadata);
    message.submitTime !== undefined && (obj.submitTime = message.submitTime.toISOString());
    return obj;
  },

  fromPartial(object: DeepPartial<Vote>): Vote {
    const message = createBaseVote();
    message.proposalId = object.proposalId !== undefined && object.proposalId !== null ? Long.fromValue(object.proposalId) : Long.UZERO;
    message.voter = object.voter ?? "";
    message.option = object.option ?? 0;
    message.metadata = object.metadata ?? "";
    message.submitTime = object.submitTime ?? undefined;
    return message;
  }

};