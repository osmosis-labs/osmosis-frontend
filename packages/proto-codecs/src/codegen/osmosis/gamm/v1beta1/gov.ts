//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  BalancerToConcentratedPoolLink,
  BalancerToConcentratedPoolLinkAmino,
  BalancerToConcentratedPoolLinkSDKType,
} from "./genesis";
/**
 * ReplaceMigrationRecordsProposal is a gov Content type for updating the
 * migration records. If a ReplaceMigrationRecordsProposal passes, the
 * proposal’s records override the existing MigrationRecords set in the module.
 * Each record specifies a single connection between a single balancer pool and
 * a single concentrated pool.
 */
export interface ReplaceMigrationRecordsProposal {
  $typeUrl?: string;
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLink[];
}
export interface ReplaceMigrationRecordsProposalProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.ReplaceMigrationRecordsProposal";
  value: Uint8Array;
}
/**
 * ReplaceMigrationRecordsProposal is a gov Content type for updating the
 * migration records. If a ReplaceMigrationRecordsProposal passes, the
 * proposal’s records override the existing MigrationRecords set in the module.
 * Each record specifies a single connection between a single balancer pool and
 * a single concentrated pool.
 */
export interface ReplaceMigrationRecordsProposalAmino {
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLinkAmino[];
}
export interface ReplaceMigrationRecordsProposalAminoMsg {
  type: "osmosis/ReplaceMigrationRecordsProposal";
  value: ReplaceMigrationRecordsProposalAmino;
}
/**
 * ReplaceMigrationRecordsProposal is a gov Content type for updating the
 * migration records. If a ReplaceMigrationRecordsProposal passes, the
 * proposal’s records override the existing MigrationRecords set in the module.
 * Each record specifies a single connection between a single balancer pool and
 * a single concentrated pool.
 */
export interface ReplaceMigrationRecordsProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLinkSDKType[];
}
/**
 * For example: if the existing DistrRecords were:
 * [(Balancer 1, CL 5), (Balancer 2, CL 6), (Balancer 3, CL 7)]
 * And an UpdateMigrationRecordsProposal includes
 * [(Balancer 2, CL 0), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 * This would leave Balancer 1 record, delete Balancer 2 record,
 * Edit Balancer 3 record, and Add Balancer 4 record
 * The result MigrationRecords in state would be:
 * [(Balancer 1, CL 5), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 */
export interface UpdateMigrationRecordsProposal {
  $typeUrl?: string;
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLink[];
}
export interface UpdateMigrationRecordsProposalProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.UpdateMigrationRecordsProposal";
  value: Uint8Array;
}
/**
 * For example: if the existing DistrRecords were:
 * [(Balancer 1, CL 5), (Balancer 2, CL 6), (Balancer 3, CL 7)]
 * And an UpdateMigrationRecordsProposal includes
 * [(Balancer 2, CL 0), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 * This would leave Balancer 1 record, delete Balancer 2 record,
 * Edit Balancer 3 record, and Add Balancer 4 record
 * The result MigrationRecords in state would be:
 * [(Balancer 1, CL 5), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 */
export interface UpdateMigrationRecordsProposalAmino {
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLinkAmino[];
}
export interface UpdateMigrationRecordsProposalAminoMsg {
  type: "osmosis/UpdateMigrationRecordsProposal";
  value: UpdateMigrationRecordsProposalAmino;
}
/**
 * For example: if the existing DistrRecords were:
 * [(Balancer 1, CL 5), (Balancer 2, CL 6), (Balancer 3, CL 7)]
 * And an UpdateMigrationRecordsProposal includes
 * [(Balancer 2, CL 0), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 * This would leave Balancer 1 record, delete Balancer 2 record,
 * Edit Balancer 3 record, and Add Balancer 4 record
 * The result MigrationRecords in state would be:
 * [(Balancer 1, CL 5), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 */
export interface UpdateMigrationRecordsProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLinkSDKType[];
}
function createBaseReplaceMigrationRecordsProposal(): ReplaceMigrationRecordsProposal {
  return {
    $typeUrl: "/osmosis.gamm.v1beta1.ReplaceMigrationRecordsProposal",
    title: "",
    description: "",
    records: [],
  };
}
export const ReplaceMigrationRecordsProposal = {
  typeUrl: "/osmosis.gamm.v1beta1.ReplaceMigrationRecordsProposal",
  encode(
    message: ReplaceMigrationRecordsProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.records) {
      BalancerToConcentratedPoolLink.encode(
        v!,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ReplaceMigrationRecordsProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReplaceMigrationRecordsProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.records.push(
            BalancerToConcentratedPoolLink.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<ReplaceMigrationRecordsProposal>
  ): ReplaceMigrationRecordsProposal {
    const message = createBaseReplaceMigrationRecordsProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.records =
      object.records?.map((e) =>
        BalancerToConcentratedPoolLink.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(
    object: ReplaceMigrationRecordsProposalAmino
  ): ReplaceMigrationRecordsProposal {
    return {
      title: object.title,
      description: object.description,
      records: Array.isArray(object?.records)
        ? object.records.map((e: any) =>
            BalancerToConcentratedPoolLink.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: ReplaceMigrationRecordsProposal
  ): ReplaceMigrationRecordsProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    if (message.records) {
      obj.records = message.records.map((e) =>
        e ? BalancerToConcentratedPoolLink.toAmino(e) : undefined
      );
    } else {
      obj.records = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: ReplaceMigrationRecordsProposalAminoMsg
  ): ReplaceMigrationRecordsProposal {
    return ReplaceMigrationRecordsProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: ReplaceMigrationRecordsProposal
  ): ReplaceMigrationRecordsProposalAminoMsg {
    return {
      type: "osmosis/ReplaceMigrationRecordsProposal",
      value: ReplaceMigrationRecordsProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ReplaceMigrationRecordsProposalProtoMsg
  ): ReplaceMigrationRecordsProposal {
    return ReplaceMigrationRecordsProposal.decode(message.value);
  },
  toProto(message: ReplaceMigrationRecordsProposal): Uint8Array {
    return ReplaceMigrationRecordsProposal.encode(message).finish();
  },
  toProtoMsg(
    message: ReplaceMigrationRecordsProposal
  ): ReplaceMigrationRecordsProposalProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.ReplaceMigrationRecordsProposal",
      value: ReplaceMigrationRecordsProposal.encode(message).finish(),
    };
  },
};
function createBaseUpdateMigrationRecordsProposal(): UpdateMigrationRecordsProposal {
  return {
    $typeUrl: "/osmosis.gamm.v1beta1.UpdateMigrationRecordsProposal",
    title: "",
    description: "",
    records: [],
  };
}
export const UpdateMigrationRecordsProposal = {
  typeUrl: "/osmosis.gamm.v1beta1.UpdateMigrationRecordsProposal",
  encode(
    message: UpdateMigrationRecordsProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.records) {
      BalancerToConcentratedPoolLink.encode(
        v!,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UpdateMigrationRecordsProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateMigrationRecordsProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.records.push(
            BalancerToConcentratedPoolLink.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<UpdateMigrationRecordsProposal>
  ): UpdateMigrationRecordsProposal {
    const message = createBaseUpdateMigrationRecordsProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.records =
      object.records?.map((e) =>
        BalancerToConcentratedPoolLink.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(
    object: UpdateMigrationRecordsProposalAmino
  ): UpdateMigrationRecordsProposal {
    return {
      title: object.title,
      description: object.description,
      records: Array.isArray(object?.records)
        ? object.records.map((e: any) =>
            BalancerToConcentratedPoolLink.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: UpdateMigrationRecordsProposal
  ): UpdateMigrationRecordsProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    if (message.records) {
      obj.records = message.records.map((e) =>
        e ? BalancerToConcentratedPoolLink.toAmino(e) : undefined
      );
    } else {
      obj.records = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: UpdateMigrationRecordsProposalAminoMsg
  ): UpdateMigrationRecordsProposal {
    return UpdateMigrationRecordsProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: UpdateMigrationRecordsProposal
  ): UpdateMigrationRecordsProposalAminoMsg {
    return {
      type: "osmosis/UpdateMigrationRecordsProposal",
      value: UpdateMigrationRecordsProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UpdateMigrationRecordsProposalProtoMsg
  ): UpdateMigrationRecordsProposal {
    return UpdateMigrationRecordsProposal.decode(message.value);
  },
  toProto(message: UpdateMigrationRecordsProposal): Uint8Array {
    return UpdateMigrationRecordsProposal.encode(message).finish();
  },
  toProtoMsg(
    message: UpdateMigrationRecordsProposal
  ): UpdateMigrationRecordsProposalProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.UpdateMigrationRecordsProposal",
      value: UpdateMigrationRecordsProposal.encode(message).finish(),
    };
  },
};
