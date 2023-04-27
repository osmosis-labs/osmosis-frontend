/* eslint-disable import/no-extraneous-dependencies */
import telescope from "@osmonauts/telescope";
import { join } from "path";
import { sync as rimraf } from "rimraf";

const protoDirs = [
  join(__dirname, "/../chain-proto/cosmos"),
  join(__dirname, "/../chain-proto/ibc"),
  join(__dirname, "/../chain-proto/osmosis"),
  join(__dirname, "/../chain-proto/cosmwasm"),
  join(__dirname, "/proto-dependencies"),
];
const outPath = join(__dirname, "/../src/osmojs");
rimraf(outPath);

telescope({
  protoDirs,
  outPath,
  options: {
    removeUnusedImports: true,
    tsDisable: {
      disableAll: true,
    },
    experimentalGlobalProtoNamespace: true, //  [ 'v1beta1' ] concentratedliquidity
    prototypes: {
      addTypeUrlToDecoders: true,
      addTypeUrlToObjects: true,

      excluded: {
        packages: [
          // 'ibc.applications.fee.v1',

          "cosmos.app.v1alpha1",
          "cosmos.app.v1beta1",
          "cosmos.autocli.v1",
          "cosmos.base.kv.v1beta1",
          "cosmos.base.reflection.v1beta1",
          "cosmos.base.snapshots.v1beta1",
          "cosmos.base.store.v1beta1",
          "cosmos.base.tendermint.v1beta1",
          "cosmos.capability.v1beta1",
          "cosmos.crisis.v1beta1",
          "cosmos.evidence.v1beta1",
          "cosmos.feegrant.v1beta1",
          "cosmos.genutil.v1beta1",
          "cosmos.group.v1",
          "cosmos.group.v1beta1",
          "cosmos.mint.v1beta1",
          "cosmos.msg.v1",
          "cosmos.nft.v1beta1",
          "cosmos.orm.v1",
          "cosmos.orm.v1alpha1",
          "cosmos.params.v1beta1",
          "cosmos.slashing.v1beta1",
          "cosmos.vesting.v1beta1",
          "google.api",
          "ibc.core.port.v1",
          "ibc.core.types.v1",
        ],
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
  },
})
  .then(() => {
    console.log("✨ all done!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
