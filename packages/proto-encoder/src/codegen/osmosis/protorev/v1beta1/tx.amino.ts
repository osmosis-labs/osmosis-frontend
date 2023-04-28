//@ts-nocheck
import {
  MsgSetBaseDenoms,
  MsgSetDeveloperAccount,
  MsgSetHotRoutes,
  MsgSetMaxPoolPointsPerBlock,
  MsgSetMaxPoolPointsPerTx,
  MsgSetPoolWeights,
} from "./tx";
export const AminoConverter = {
  "/osmosis.protorev.v1beta1.MsgSetHotRoutes": {
    aminoType: "osmosis/MsgSetHotRoutes",
    toAmino: MsgSetHotRoutes.toAmino,
    fromAmino: MsgSetHotRoutes.fromAmino,
  },
  "/osmosis.protorev.v1beta1.MsgSetDeveloperAccount": {
    aminoType: "osmosis/MsgSetDeveloperAccount",
    toAmino: MsgSetDeveloperAccount.toAmino,
    fromAmino: MsgSetDeveloperAccount.fromAmino,
  },
  "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerTx": {
    aminoType: "osmosis/protorev/set-max-pool-points-per-tx",
    toAmino: MsgSetMaxPoolPointsPerTx.toAmino,
    fromAmino: MsgSetMaxPoolPointsPerTx.fromAmino,
  },
  "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerBlock": {
    aminoType: "osmosis/protorev/set-max-pool-points-per-block",
    toAmino: MsgSetMaxPoolPointsPerBlock.toAmino,
    fromAmino: MsgSetMaxPoolPointsPerBlock.fromAmino,
  },
  "/osmosis.protorev.v1beta1.MsgSetPoolWeights": {
    aminoType: "osmosis/protorev/set-pool-weights",
    toAmino: MsgSetPoolWeights.toAmino,
    fromAmino: MsgSetPoolWeights.fromAmino,
  },
  "/osmosis.protorev.v1beta1.MsgSetBaseDenoms": {
    aminoType: "osmosis/protorev/set-base-denoms",
    toAmino: MsgSetBaseDenoms.toAmino,
    fromAmino: MsgSetBaseDenoms.fromAmino,
  },
};
