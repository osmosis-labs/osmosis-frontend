import { Coin } from "../../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../../google/protobuf/timestamp";
import { Duration } from "../../../google/protobuf/duration";
import { AminoMsg } from "@cosmjs/amino";
import { Long } from "@osmonauts/helpers";
import { MsgCreateSale, MsgSubscribe, MsgWithdraw, MsgExitSale, MsgFinalizeSale } from "./tx";
export interface AminoMsgCreateSale extends AminoMsg {
  type: "osmosis/streamswap/v1/create-sale";
  value: {
    creator: string;
    token_in: string;
    token_out: {
      denom: string;
      amount: string;
    };
    max_fee: {
      denom: string;
      amount: string;
    }[];
    start_time: {
      seconds: string;
      nanos: number;
    };
    duration: {
      seconds: string;
      nanos: number;
    };
    recipient: string;
    name: string;
    url: string;
  };
}
export interface AminoMsgSubscribe extends AminoMsg {
  type: "osmosis/streamswap/v1/subscribe";
  value: {
    sender: string;
    sale_id: string;
    amount: string;
  };
}
export interface AminoMsgWithdraw extends AminoMsg {
  type: "osmosis/streamswap/v1/withdraw";
  value: {
    sender: string;
    sale_id: string;
    amount: string;
  };
}
export interface AminoMsgExitSale extends AminoMsg {
  type: "osmosis/streamswap/v1/exit-sale";
  value: {
    sender: string;
    sale_id: string;
  };
}
export interface AminoMsgFinalizeSale extends AminoMsg {
  type: "osmosis/streamswap/v1/finalize-sale";
  value: {
    sender: string;
    sale_id: string;
  };
}
export const AminoConverter = {
  "/osmosis.streamswap.v1.MsgCreateSale": {
    aminoType: "osmosis/streamswap/v1/create-sale",
    toAmino: ({
      creator,
      tokenIn,
      tokenOut,
      maxFee,
      startTime,
      duration,
      recipient,
      name,
      url
    }: MsgCreateSale): AminoMsgCreateSale["value"] => {
      return {
        creator,
        token_in: tokenIn,
        token_out: {
          denom: tokenOut.denom,
          amount: Long.fromNumber(tokenOut.amount).toString()
        },
        max_fee: maxFee.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        })),
        start_time: startTime,
        duration: (duration * 1_000_000_000).toString(),
        recipient,
        name,
        url
      };
    },
    fromAmino: ({
      creator,
      token_in,
      token_out,
      max_fee,
      start_time,
      duration,
      recipient,
      name,
      url
    }: AminoMsgCreateSale["value"]): MsgCreateSale => {
      return {
        creator,
        tokenIn: token_in,
        tokenOut: {
          denom: token_out.denom,
          amount: token_out.amount
        },
        maxFee: max_fee.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        })),
        startTime: start_time,
        duration: {
          seconds: Long.fromNumber(Math.floor(parseInt(duration) / 1_000_000_000)),
          nanos: parseInt(duration) % 1_000_000_000
        },
        recipient,
        name,
        url
      };
    }
  },
  "/osmosis.streamswap.v1.MsgSubscribe": {
    aminoType: "osmosis/streamswap/v1/subscribe",
    toAmino: ({
      sender,
      saleId,
      amount
    }: MsgSubscribe): AminoMsgSubscribe["value"] => {
      return {
        sender,
        sale_id: saleId.toString(),
        amount
      };
    },
    fromAmino: ({
      sender,
      sale_id,
      amount
    }: AminoMsgSubscribe["value"]): MsgSubscribe => {
      return {
        sender,
        saleId: Long.fromString(sale_id),
        amount
      };
    }
  },
  "/osmosis.streamswap.v1.MsgWithdraw": {
    aminoType: "osmosis/streamswap/v1/withdraw",
    toAmino: ({
      sender,
      saleId,
      amount
    }: MsgWithdraw): AminoMsgWithdraw["value"] => {
      return {
        sender,
        sale_id: saleId.toString(),
        amount
      };
    },
    fromAmino: ({
      sender,
      sale_id,
      amount
    }: AminoMsgWithdraw["value"]): MsgWithdraw => {
      return {
        sender,
        saleId: Long.fromString(sale_id),
        amount
      };
    }
  },
  "/osmosis.streamswap.v1.MsgExitSale": {
    aminoType: "osmosis/streamswap/v1/exit-sale",
    toAmino: ({
      sender,
      saleId
    }: MsgExitSale): AminoMsgExitSale["value"] => {
      return {
        sender,
        sale_id: saleId.toString()
      };
    },
    fromAmino: ({
      sender,
      sale_id
    }: AminoMsgExitSale["value"]): MsgExitSale => {
      return {
        sender,
        saleId: Long.fromString(sale_id)
      };
    }
  },
  "/osmosis.streamswap.v1.MsgFinalizeSale": {
    aminoType: "osmosis/streamswap/v1/finalize-sale",
    toAmino: ({
      sender,
      saleId
    }: MsgFinalizeSale): AminoMsgFinalizeSale["value"] => {
      return {
        sender,
        sale_id: saleId.toString()
      };
    },
    fromAmino: ({
      sender,
      sale_id
    }: AminoMsgFinalizeSale["value"]): MsgFinalizeSale => {
      return {
        sender,
        saleId: Long.fromString(sale_id)
      };
    }
  }
};