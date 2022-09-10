import { coin } from "@cosmjs/proto-signing";
import { MsgJoinPool, MsgSwapExactAmountIn } from "../../../../src/codegen/osmosis/gamm/v1beta1/tx";
import Long from 'long';
import {
  AminoTypes,
} from '@cosmjs/stargate';

import { AminoMsgJoinPool, AminoMsgSwapExactAmountIn, AminoConverter } from "../../../../src/codegen/osmosis/gamm/v1beta1/tx.amino";

describe("AminoTypes", () => {
  describe("toAmino", () => {
    it("works for MsgJoinPool", () => {
      const msg: MsgJoinPool = {
        sender: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        poolId: Long.fromNumber(3),
        shareOutAmount: "1000",
        tokenInMaxs: [
          coin(1234, "uosmo")
        ]
      };
      const aminoTypes = new AminoTypes({ ...AminoConverter });
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool",
        value: msg,
      });
      const expected: AminoMsgJoinPool = {
        type: "osmosis/gamm/join-pool",
        value: {
          sender: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          pool_id: "3",
          share_out_amount: "1000",
          token_in_maxs: [
            coin(1234, "uosmo")
          ]

        },
      };
      expect(aminoMsg).toEqual(expected);
    });
    it("works for MsgSwapExactAmountIn", () => {
      const msg: MsgSwapExactAmountIn = {
        sender: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        routes: [
          {
            poolId: Long.fromNumber(1),
            tokenOutDenom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
          }
        ],
        tokenIn: {
          denom: 'uosmo',
          amount: '25652'
        },
        tokenOutMinAmount: '6036'
      };
      const aminoTypes = new AminoTypes({ ...AminoConverter });
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
        value: msg,
      });
      const expected: AminoMsgSwapExactAmountIn = {
        type: "osmosis/gamm/swap-exact-amount-in",
        value: {
          sender: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          routes: [
            {
              pool_id: "1",
              token_out_denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
            }
          ],
          token_in: {
            denom: 'uosmo',
            amount: '25652'
          },
          token_out_min_amount: '6036'
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });

  describe("fromAmino", () => {
    it("works for MsgJoinPool", () => {
      const aminoMsg: AminoMsgJoinPool = {
        type: "osmosis/gamm/join-pool",
        value: {
          sender: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          pool_id: "3",
          share_out_amount: "1000",
          token_in_maxs: [
            coin(1234, "uosmo")
          ]
        },
      };
      const msg = new AminoTypes({ ...AminoConverter }).fromAmino(aminoMsg);
      const expectedValue: MsgJoinPool = {
        sender: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        poolId: Long.fromNumber(3),
        shareOutAmount: "1000",
        tokenInMaxs: [
          coin(1234, "uosmo")
        ]
      };
      expect(msg).toEqual({
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool",
        value: expectedValue,
      });
    });
    it("works for MsgSwapExactAmountIn", () => {
      const aminoMsg: AminoMsgSwapExactAmountIn = {
        type: "osmosis/gamm/swap-exact-amount-in",
        value: {
          sender: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          routes: [
            {
              pool_id: "1",
              token_out_denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
            }
          ],
          token_in: {
            denom: 'uosmo',
            amount: '25652'
          },
          token_out_min_amount: '6036'
        },
      };
      const msg = new AminoTypes({ ...AminoConverter }).fromAmino(aminoMsg);
      const expectedValue: MsgSwapExactAmountIn = {
        sender: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        routes: [
          {
            poolId: Long.fromNumber(1),
            tokenOutDenom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
          }
        ],
        tokenIn: {
          denom: 'uosmo',
          amount: '25652'
        },
        tokenOutMinAmount: '6036'
      };
      expect(msg).toEqual({
        typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
        value: expectedValue,
      });
    });
  });
});
