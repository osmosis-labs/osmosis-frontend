import { coin } from "@cosmjs/proto-signing";
import { MsgLockTokens } from "../../../../src/codegen/osmosis/lockup/tx";
import Long from 'long';
import {
  AminoTypes,
} from '@cosmjs/stargate';

import { AminoMsgLockTokens, AminoConverter } from "../../../../src/codegen/osmosis/lockup/tx.amino";

describe("AminoTypes", () => {
  describe("toAmino", () => {
    xit("works for MsgLockTokens", () => {
      const msg: MsgLockTokens = {
        owner: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        duration: "1209600",
        coins: [
          {
            amount: "42302974777419323",
            denom: "gamm/pool/1"
          }
        ]
      };
      const aminoTypes = new AminoTypes({ ...AminoConverter });
      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/osmosis.lockup.MsgLockTokens",
        value: msg,
      });
      const expected: AminoMsgLockTokens = {
        type: "osmosis/lockup/lock-tokens",
        value: {
          owner: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          duration: "1209600",
          coins: [
            {
              amount: "42302974777419323",
              denom: "gamm/pool/1"
            }
          ]
        },
      };
      expect(aminoMsg).toEqual(expected);
    });
  });

  describe("fromAmino", () => {
    xit("works for MsgLockTokens", () => {
      const aminoMsg: AminoMsgLockTokens = {
        type: "osmosis/lockup/lock-tokens",
        value: {
          owner: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
          duration: "1209600",
          coins: [
            {
              amount: "42302974777419323",
              denom: "gamm/pool/1"
            }
          ]
        },
      };
      const msg = new AminoTypes({ ...AminoConverter }).fromAmino(aminoMsg);
      const expectedValue: MsgLockTokens = {
        owner: "osmo1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        duration: "1209600",
        coins: [
          {
            amount: "42302974777419323",
            denom: "gamm/pool/1"
          }
        ]
      };
      expect(msg).toEqual({
        typeUrl: "/osmosis.lockup.MsgLockTokens",
        value: expectedValue,
      });
    });
  });
});
