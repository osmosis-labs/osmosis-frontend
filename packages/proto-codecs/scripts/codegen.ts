/* eslint-disable import/no-extraneous-dependencies */
import { ProtoStore } from "@osmonauts/proto-parser";
import telescope from "@osmonauts/telescope";
import { join } from "path";
import { sync as rimraf } from "rimraf";

import { AvailablePackages } from "./generated/package-types";
import { protoDirs } from "./utils";

const outPath = join(__dirname, "/../src/codegen");
rimraf(outPath);

const packages = new ProtoStore(protoDirs).getPackages() as AvailablePackages[];

const includedPackages: AvailablePackages[] = [
  "cosmos.base.v1beta1",
  "cosmos.auth.v1beta1",
  "cosmos.bank.v1beta1",
  "cosmos.base.query.v1beta1",
  "cosmos.staking.v1beta1",
  "cosmos.staking.v1beta1",
  "cosmos.upgrade.v1beta1",
  "osmosis.gamm.v1beta1",
  "osmosis.gamm.poolmodels.stableswap.v1beta1",
  "osmosis.gamm.poolmodels.balancer.v1beta1",
  "osmosis.concentratedliquidity",
  "osmosis.concentratedliquidity.v1beta1",
  "osmosis.cosmwasmpool.v1beta1",
  "osmosis.poolmanager.v1beta1",
  "osmosis.superfluid.v1beta1",
  "osmosis.superfluid",
  "osmosis.accum.v1beta1",
  "osmosis.lockup",
  "ibc.core.client.v1",
  "ibc.applications.transfer.v1",
  "ibc.applications.transfer.v2",
  "cosmwasm.wasm.v1",
  "google.protobuf",
  "google.api",
  "gogoproto",
  "tendermint.types",
  "tendermint.crypto",
  "tendermint.version",
  "osmosis.concentratedliquidity.v1beta1",
  "osmosis.concentratedliquidity.poolmodels.concentrated.v1beta1",
];

telescope({
  protoDirs,
  outPath,
  options: {
    removeUnusedImports: true,
    tsDisable: {
      disableAll: true,
    },
    prototypes: {
      addTypeUrlToDecoders: true,
      addTypeUrlToObjects: true,
      excluded: {
        packages: packages.filter((val) => !includedPackages.includes(val)),
      },
      methods: {
        fromJSON: false,
        toJSON: false,

        encode: true,
        decode: true,
        fromPartial: true,

        // toSDK: true,
        // fromSDK: true,

        toAmino: true,
        fromAmino: true,
        fromProto: true,
        toProto: true,
      },
      parser: {
        keepCase: false,
      },
      typingsFormat: {
        duration: "duration",
        timestamp: "date",
        useExact: false,
        useDeepPartial: false,
      },
    },
    aminoEncoding: {
      enabled: true,
      exceptions: {
        // '/cosmos-sdk/MsgWithdrawValCommission': {
        //   aminoType: 'cosmos-sdk/MsgWithdrawValidatorCommission'
        // },
      },
      useRecursiveV2encoding: true,
    },
    interfaces: {
      enabled: true,
      useUnionTypes: false,
    },
    lcdClients: {
      enabled: false,
    },
    rpcClients: {
      enabled: false,
    },
  },
})
  .then(() => {
    console.log("✨ all done!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
