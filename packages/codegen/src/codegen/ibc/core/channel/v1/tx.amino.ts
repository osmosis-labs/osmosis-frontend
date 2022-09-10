import { Channel, Packet, Counterparty, stateFromJSON, orderFromJSON } from "./channel";
import { Height } from "../../client/v1/client";
import { AminoMsg } from "@cosmjs/amino";
import { AminoHeight, omitDefault, Long } from "@osmonauts/helpers";
import { MsgChannelOpenInit, MsgChannelOpenTry, MsgChannelOpenAck, MsgChannelOpenConfirm, MsgChannelCloseInit, MsgChannelCloseConfirm, MsgRecvPacket, MsgTimeout, MsgTimeoutOnClose, MsgAcknowledgement } from "./tx";
export interface AminoMsgChannelOpenInit extends AminoMsg {
  type: "cosmos-sdk/MsgChannelOpenInit";
  value: {
    port_id: string;
    channel: {
      state: number;
      ordering: number;
      counterparty: {
        port_id: string;
        channel_id: string;
      };
      connection_hops: string[];
      version: string;
    };
    signer: string;
  };
}
export interface AminoMsgChannelOpenTry extends AminoMsg {
  type: "cosmos-sdk/MsgChannelOpenTry";
  value: {
    port_id: string;
    previous_channel_id: string;
    channel: {
      state: number;
      ordering: number;
      counterparty: {
        port_id: string;
        channel_id: string;
      };
      connection_hops: string[];
      version: string;
    };
    counterparty_version: string;
    proof_init: Uint8Array;
    proof_height: AminoHeight;
    signer: string;
  };
}
export interface AminoMsgChannelOpenAck extends AminoMsg {
  type: "cosmos-sdk/MsgChannelOpenAck";
  value: {
    port_id: string;
    channel_id: string;
    counterparty_channel_id: string;
    counterparty_version: string;
    proof_try: Uint8Array;
    proof_height: AminoHeight;
    signer: string;
  };
}
export interface AminoMsgChannelOpenConfirm extends AminoMsg {
  type: "cosmos-sdk/MsgChannelOpenConfirm";
  value: {
    port_id: string;
    channel_id: string;
    proof_ack: Uint8Array;
    proof_height: AminoHeight;
    signer: string;
  };
}
export interface AminoMsgChannelCloseInit extends AminoMsg {
  type: "cosmos-sdk/MsgChannelCloseInit";
  value: {
    port_id: string;
    channel_id: string;
    signer: string;
  };
}
export interface AminoMsgChannelCloseConfirm extends AminoMsg {
  type: "cosmos-sdk/MsgChannelCloseConfirm";
  value: {
    port_id: string;
    channel_id: string;
    proof_init: Uint8Array;
    proof_height: AminoHeight;
    signer: string;
  };
}
export interface AminoMsgRecvPacket extends AminoMsg {
  type: "cosmos-sdk/MsgRecvPacket";
  value: {
    packet: {
      sequence: string;
      source_port: string;
      source_channel: string;
      destination_port: string;
      destination_channel: string;
      data: Uint8Array;
      timeout_height: AminoHeight;
      timeout_timestamp: string;
    };
    proof_commitment: Uint8Array;
    proof_height: AminoHeight;
    signer: string;
  };
}
export interface AminoMsgTimeout extends AminoMsg {
  type: "cosmos-sdk/MsgTimeout";
  value: {
    packet: {
      sequence: string;
      source_port: string;
      source_channel: string;
      destination_port: string;
      destination_channel: string;
      data: Uint8Array;
      timeout_height: AminoHeight;
      timeout_timestamp: string;
    };
    proof_unreceived: Uint8Array;
    proof_height: AminoHeight;
    next_sequence_recv: string;
    signer: string;
  };
}
export interface AminoMsgTimeoutOnClose extends AminoMsg {
  type: "cosmos-sdk/MsgTimeoutOnClose";
  value: {
    packet: {
      sequence: string;
      source_port: string;
      source_channel: string;
      destination_port: string;
      destination_channel: string;
      data: Uint8Array;
      timeout_height: AminoHeight;
      timeout_timestamp: string;
    };
    proof_unreceived: Uint8Array;
    proof_close: Uint8Array;
    proof_height: AminoHeight;
    next_sequence_recv: string;
    signer: string;
  };
}
export interface AminoMsgAcknowledgement extends AminoMsg {
  type: "cosmos-sdk/MsgAcknowledgement";
  value: {
    packet: {
      sequence: string;
      source_port: string;
      source_channel: string;
      destination_port: string;
      destination_channel: string;
      data: Uint8Array;
      timeout_height: AminoHeight;
      timeout_timestamp: string;
    };
    acknowledgement: Uint8Array;
    proof_acked: Uint8Array;
    proof_height: AminoHeight;
    signer: string;
  };
}
export const AminoConverter = {
  "/ibc.core.channel.v1.MsgChannelOpenInit": {
    aminoType: "cosmos-sdk/MsgChannelOpenInit",
    toAmino: ({
      portId,
      channel,
      signer
    }: MsgChannelOpenInit): AminoMsgChannelOpenInit["value"] => {
      return {
        port_id: portId,
        channel: {
          state: channel.state,
          ordering: channel.ordering,
          counterparty: {
            port_id: channel.counterparty.portId,
            channel_id: channel.counterparty.channelId
          },
          connection_hops: channel.connectionHops,
          version: channel.version
        },
        signer
      };
    },
    fromAmino: ({
      port_id,
      channel,
      signer
    }: AminoMsgChannelOpenInit["value"]): MsgChannelOpenInit => {
      return {
        portId: port_id,
        channel: {
          state: stateFromJSON(channel.state),
          ordering: orderFromJSON(channel.ordering),
          counterparty: {
            portId: channel.counterparty.port_id,
            channelId: channel.counterparty.channel_id
          },
          connectionHops: channel.connection_hops,
          version: channel.version
        },
        signer
      };
    }
  },
  "/ibc.core.channel.v1.MsgChannelOpenTry": {
    aminoType: "cosmos-sdk/MsgChannelOpenTry",
    toAmino: ({
      portId,
      previousChannelId,
      channel,
      counterpartyVersion,
      proofInit,
      proofHeight,
      signer
    }: MsgChannelOpenTry): AminoMsgChannelOpenTry["value"] => {
      return {
        port_id: portId,
        previous_channel_id: previousChannelId,
        channel: {
          state: channel.state,
          ordering: channel.ordering,
          counterparty: {
            port_id: channel.counterparty.portId,
            channel_id: channel.counterparty.channelId
          },
          connection_hops: channel.connectionHops,
          version: channel.version
        },
        counterparty_version: counterpartyVersion,
        proof_init: proofInit,
        proof_height: proofHeight ? {
          revision_height: omitDefault(proofHeight.revisionHeight)?.toString(),
          revision_number: omitDefault(proofHeight.revisionNumber)?.toString()
        } : {},
        signer
      };
    },
    fromAmino: ({
      port_id,
      previous_channel_id,
      channel,
      counterparty_version,
      proof_init,
      proof_height,
      signer
    }: AminoMsgChannelOpenTry["value"]): MsgChannelOpenTry => {
      return {
        portId: port_id,
        previousChannelId: previous_channel_id,
        channel: {
          state: stateFromJSON(channel.state),
          ordering: orderFromJSON(channel.ordering),
          counterparty: {
            portId: channel.counterparty.port_id,
            channelId: channel.counterparty.channel_id
          },
          connectionHops: channel.connection_hops,
          version: channel.version
        },
        counterpartyVersion: counterparty_version,
        proofInit: proof_init,
        proofHeight: proof_height ? {
          revisionHeight: Long.fromString(proof_height.revision_height || "0", true),
          revisionNumber: Long.fromString(proof_height.revision_number || "0", true)
        } : undefined,
        signer
      };
    }
  },
  "/ibc.core.channel.v1.MsgChannelOpenAck": {
    aminoType: "cosmos-sdk/MsgChannelOpenAck",
    toAmino: ({
      portId,
      channelId,
      counterpartyChannelId,
      counterpartyVersion,
      proofTry,
      proofHeight,
      signer
    }: MsgChannelOpenAck): AminoMsgChannelOpenAck["value"] => {
      return {
        port_id: portId,
        channel_id: channelId,
        counterparty_channel_id: counterpartyChannelId,
        counterparty_version: counterpartyVersion,
        proof_try: proofTry,
        proof_height: proofHeight ? {
          revision_height: omitDefault(proofHeight.revisionHeight)?.toString(),
          revision_number: omitDefault(proofHeight.revisionNumber)?.toString()
        } : {},
        signer
      };
    },
    fromAmino: ({
      port_id,
      channel_id,
      counterparty_channel_id,
      counterparty_version,
      proof_try,
      proof_height,
      signer
    }: AminoMsgChannelOpenAck["value"]): MsgChannelOpenAck => {
      return {
        portId: port_id,
        channelId: channel_id,
        counterpartyChannelId: counterparty_channel_id,
        counterpartyVersion: counterparty_version,
        proofTry: proof_try,
        proofHeight: proof_height ? {
          revisionHeight: Long.fromString(proof_height.revision_height || "0", true),
          revisionNumber: Long.fromString(proof_height.revision_number || "0", true)
        } : undefined,
        signer
      };
    }
  },
  "/ibc.core.channel.v1.MsgChannelOpenConfirm": {
    aminoType: "cosmos-sdk/MsgChannelOpenConfirm",
    toAmino: ({
      portId,
      channelId,
      proofAck,
      proofHeight,
      signer
    }: MsgChannelOpenConfirm): AminoMsgChannelOpenConfirm["value"] => {
      return {
        port_id: portId,
        channel_id: channelId,
        proof_ack: proofAck,
        proof_height: proofHeight ? {
          revision_height: omitDefault(proofHeight.revisionHeight)?.toString(),
          revision_number: omitDefault(proofHeight.revisionNumber)?.toString()
        } : {},
        signer
      };
    },
    fromAmino: ({
      port_id,
      channel_id,
      proof_ack,
      proof_height,
      signer
    }: AminoMsgChannelOpenConfirm["value"]): MsgChannelOpenConfirm => {
      return {
        portId: port_id,
        channelId: channel_id,
        proofAck: proof_ack,
        proofHeight: proof_height ? {
          revisionHeight: Long.fromString(proof_height.revision_height || "0", true),
          revisionNumber: Long.fromString(proof_height.revision_number || "0", true)
        } : undefined,
        signer
      };
    }
  },
  "/ibc.core.channel.v1.MsgChannelCloseInit": {
    aminoType: "cosmos-sdk/MsgChannelCloseInit",
    toAmino: ({
      portId,
      channelId,
      signer
    }: MsgChannelCloseInit): AminoMsgChannelCloseInit["value"] => {
      return {
        port_id: portId,
        channel_id: channelId,
        signer
      };
    },
    fromAmino: ({
      port_id,
      channel_id,
      signer
    }: AminoMsgChannelCloseInit["value"]): MsgChannelCloseInit => {
      return {
        portId: port_id,
        channelId: channel_id,
        signer
      };
    }
  },
  "/ibc.core.channel.v1.MsgChannelCloseConfirm": {
    aminoType: "cosmos-sdk/MsgChannelCloseConfirm",
    toAmino: ({
      portId,
      channelId,
      proofInit,
      proofHeight,
      signer
    }: MsgChannelCloseConfirm): AminoMsgChannelCloseConfirm["value"] => {
      return {
        port_id: portId,
        channel_id: channelId,
        proof_init: proofInit,
        proof_height: proofHeight ? {
          revision_height: omitDefault(proofHeight.revisionHeight)?.toString(),
          revision_number: omitDefault(proofHeight.revisionNumber)?.toString()
        } : {},
        signer
      };
    },
    fromAmino: ({
      port_id,
      channel_id,
      proof_init,
      proof_height,
      signer
    }: AminoMsgChannelCloseConfirm["value"]): MsgChannelCloseConfirm => {
      return {
        portId: port_id,
        channelId: channel_id,
        proofInit: proof_init,
        proofHeight: proof_height ? {
          revisionHeight: Long.fromString(proof_height.revision_height || "0", true),
          revisionNumber: Long.fromString(proof_height.revision_number || "0", true)
        } : undefined,
        signer
      };
    }
  },
  "/ibc.core.channel.v1.MsgRecvPacket": {
    aminoType: "cosmos-sdk/MsgRecvPacket",
    toAmino: ({
      packet,
      proofCommitment,
      proofHeight,
      signer
    }: MsgRecvPacket): AminoMsgRecvPacket["value"] => {
      return {
        packet: {
          sequence: packet.sequence.toString(),
          source_port: packet.sourcePort,
          source_channel: packet.sourceChannel,
          destination_port: packet.destinationPort,
          destination_channel: packet.destinationChannel,
          data: packet.data,
          timeout_height: packet.timeoutHeight ? {
            revision_height: omitDefault(packet.timeoutHeight.revisionHeight)?.toString(),
            revision_number: omitDefault(packet.timeoutHeight.revisionNumber)?.toString()
          } : {},
          timeout_timestamp: packet.timeoutTimestamp.toString()
        },
        proof_commitment: proofCommitment,
        proof_height: proofHeight ? {
          revision_height: omitDefault(proofHeight.revisionHeight)?.toString(),
          revision_number: omitDefault(proofHeight.revisionNumber)?.toString()
        } : {},
        signer
      };
    },
    fromAmino: ({
      packet,
      proof_commitment,
      proof_height,
      signer
    }: AminoMsgRecvPacket["value"]): MsgRecvPacket => {
      return {
        packet: {
          sequence: Long.fromString(packet.sequence),
          sourcePort: packet.source_port,
          sourceChannel: packet.source_channel,
          destinationPort: packet.destination_port,
          destinationChannel: packet.destination_channel,
          data: packet.data,
          timeoutHeight: packet.timeout_height ? {
            revisionHeight: Long.fromString(packet.timeout_height.revision_height || "0", true),
            revisionNumber: Long.fromString(packet.timeout_height.revision_number || "0", true)
          } : undefined,
          timeoutTimestamp: Long.fromString(packet.timeout_timestamp)
        },
        proofCommitment: proof_commitment,
        proofHeight: proof_height ? {
          revisionHeight: Long.fromString(proof_height.revision_height || "0", true),
          revisionNumber: Long.fromString(proof_height.revision_number || "0", true)
        } : undefined,
        signer
      };
    }
  },
  "/ibc.core.channel.v1.MsgTimeout": {
    aminoType: "cosmos-sdk/MsgTimeout",
    toAmino: ({
      packet,
      proofUnreceived,
      proofHeight,
      nextSequenceRecv,
      signer
    }: MsgTimeout): AminoMsgTimeout["value"] => {
      return {
        packet: {
          sequence: packet.sequence.toString(),
          source_port: packet.sourcePort,
          source_channel: packet.sourceChannel,
          destination_port: packet.destinationPort,
          destination_channel: packet.destinationChannel,
          data: packet.data,
          timeout_height: packet.timeoutHeight ? {
            revision_height: omitDefault(packet.timeoutHeight.revisionHeight)?.toString(),
            revision_number: omitDefault(packet.timeoutHeight.revisionNumber)?.toString()
          } : {},
          timeout_timestamp: packet.timeoutTimestamp.toString()
        },
        proof_unreceived: proofUnreceived,
        proof_height: proofHeight ? {
          revision_height: omitDefault(proofHeight.revisionHeight)?.toString(),
          revision_number: omitDefault(proofHeight.revisionNumber)?.toString()
        } : {},
        next_sequence_recv: nextSequenceRecv.toString(),
        signer
      };
    },
    fromAmino: ({
      packet,
      proof_unreceived,
      proof_height,
      next_sequence_recv,
      signer
    }: AminoMsgTimeout["value"]): MsgTimeout => {
      return {
        packet: {
          sequence: Long.fromString(packet.sequence),
          sourcePort: packet.source_port,
          sourceChannel: packet.source_channel,
          destinationPort: packet.destination_port,
          destinationChannel: packet.destination_channel,
          data: packet.data,
          timeoutHeight: packet.timeout_height ? {
            revisionHeight: Long.fromString(packet.timeout_height.revision_height || "0", true),
            revisionNumber: Long.fromString(packet.timeout_height.revision_number || "0", true)
          } : undefined,
          timeoutTimestamp: Long.fromString(packet.timeout_timestamp)
        },
        proofUnreceived: proof_unreceived,
        proofHeight: proof_height ? {
          revisionHeight: Long.fromString(proof_height.revision_height || "0", true),
          revisionNumber: Long.fromString(proof_height.revision_number || "0", true)
        } : undefined,
        nextSequenceRecv: Long.fromString(next_sequence_recv),
        signer
      };
    }
  },
  "/ibc.core.channel.v1.MsgTimeoutOnClose": {
    aminoType: "cosmos-sdk/MsgTimeoutOnClose",
    toAmino: ({
      packet,
      proofUnreceived,
      proofClose,
      proofHeight,
      nextSequenceRecv,
      signer
    }: MsgTimeoutOnClose): AminoMsgTimeoutOnClose["value"] => {
      return {
        packet: {
          sequence: packet.sequence.toString(),
          source_port: packet.sourcePort,
          source_channel: packet.sourceChannel,
          destination_port: packet.destinationPort,
          destination_channel: packet.destinationChannel,
          data: packet.data,
          timeout_height: packet.timeoutHeight ? {
            revision_height: omitDefault(packet.timeoutHeight.revisionHeight)?.toString(),
            revision_number: omitDefault(packet.timeoutHeight.revisionNumber)?.toString()
          } : {},
          timeout_timestamp: packet.timeoutTimestamp.toString()
        },
        proof_unreceived: proofUnreceived,
        proof_close: proofClose,
        proof_height: proofHeight ? {
          revision_height: omitDefault(proofHeight.revisionHeight)?.toString(),
          revision_number: omitDefault(proofHeight.revisionNumber)?.toString()
        } : {},
        next_sequence_recv: nextSequenceRecv.toString(),
        signer
      };
    },
    fromAmino: ({
      packet,
      proof_unreceived,
      proof_close,
      proof_height,
      next_sequence_recv,
      signer
    }: AminoMsgTimeoutOnClose["value"]): MsgTimeoutOnClose => {
      return {
        packet: {
          sequence: Long.fromString(packet.sequence),
          sourcePort: packet.source_port,
          sourceChannel: packet.source_channel,
          destinationPort: packet.destination_port,
          destinationChannel: packet.destination_channel,
          data: packet.data,
          timeoutHeight: packet.timeout_height ? {
            revisionHeight: Long.fromString(packet.timeout_height.revision_height || "0", true),
            revisionNumber: Long.fromString(packet.timeout_height.revision_number || "0", true)
          } : undefined,
          timeoutTimestamp: Long.fromString(packet.timeout_timestamp)
        },
        proofUnreceived: proof_unreceived,
        proofClose: proof_close,
        proofHeight: proof_height ? {
          revisionHeight: Long.fromString(proof_height.revision_height || "0", true),
          revisionNumber: Long.fromString(proof_height.revision_number || "0", true)
        } : undefined,
        nextSequenceRecv: Long.fromString(next_sequence_recv),
        signer
      };
    }
  },
  "/ibc.core.channel.v1.MsgAcknowledgement": {
    aminoType: "cosmos-sdk/MsgAcknowledgement",
    toAmino: ({
      packet,
      acknowledgement,
      proofAcked,
      proofHeight,
      signer
    }: MsgAcknowledgement): AminoMsgAcknowledgement["value"] => {
      return {
        packet: {
          sequence: packet.sequence.toString(),
          source_port: packet.sourcePort,
          source_channel: packet.sourceChannel,
          destination_port: packet.destinationPort,
          destination_channel: packet.destinationChannel,
          data: packet.data,
          timeout_height: packet.timeoutHeight ? {
            revision_height: omitDefault(packet.timeoutHeight.revisionHeight)?.toString(),
            revision_number: omitDefault(packet.timeoutHeight.revisionNumber)?.toString()
          } : {},
          timeout_timestamp: packet.timeoutTimestamp.toString()
        },
        acknowledgement,
        proof_acked: proofAcked,
        proof_height: proofHeight ? {
          revision_height: omitDefault(proofHeight.revisionHeight)?.toString(),
          revision_number: omitDefault(proofHeight.revisionNumber)?.toString()
        } : {},
        signer
      };
    },
    fromAmino: ({
      packet,
      acknowledgement,
      proof_acked,
      proof_height,
      signer
    }: AminoMsgAcknowledgement["value"]): MsgAcknowledgement => {
      return {
        packet: {
          sequence: Long.fromString(packet.sequence),
          sourcePort: packet.source_port,
          sourceChannel: packet.source_channel,
          destinationPort: packet.destination_port,
          destinationChannel: packet.destination_channel,
          data: packet.data,
          timeoutHeight: packet.timeout_height ? {
            revisionHeight: Long.fromString(packet.timeout_height.revision_height || "0", true),
            revisionNumber: Long.fromString(packet.timeout_height.revision_number || "0", true)
          } : undefined,
          timeoutTimestamp: Long.fromString(packet.timeout_timestamp)
        },
        acknowledgement,
        proofAcked: proof_acked,
        proofHeight: proof_height ? {
          revisionHeight: Long.fromString(proof_height.revision_height || "0", true),
          revisionNumber: Long.fromString(proof_height.revision_number || "0", true)
        } : undefined,
        signer
      };
    }
  }
};