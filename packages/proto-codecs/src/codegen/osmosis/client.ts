//@ts-nocheck
import { GeneratedType, OfflineSigner, Registry } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  defaultRegistryTypes,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { HttpEndpoint } from "@cosmjs/tendermint-rpc";

import * as osmosisConcentratedliquidityPoolmodelConcentratedTxAmino from "./concentrated-liquidity/pool-model/concentrated/tx.amino";
import * as osmosisConcentratedliquidityPoolmodelConcentratedTxRegistry from "./concentrated-liquidity/pool-model/concentrated/tx.registry";
import * as osmosisConcentratedliquidityTxAmino from "./concentrated-liquidity/tx.amino";
import * as osmosisConcentratedliquidityTxRegistry from "./concentrated-liquidity/tx.registry";
import * as osmosisGammPoolmodelsBalancerTxTxAmino from "./gamm/pool-models/balancer/tx/tx.amino";
import * as osmosisGammPoolmodelsBalancerTxTxRegistry from "./gamm/pool-models/balancer/tx/tx.registry";
import * as osmosisGammPoolmodelsStableswapTxAmino from "./gamm/pool-models/stableswap/tx.amino";
import * as osmosisGammPoolmodelsStableswapTxRegistry from "./gamm/pool-models/stableswap/tx.registry";
import * as osmosisGammV1beta1TxAmino from "./gamm/v1beta1/tx.amino";
import * as osmosisGammV1beta1TxRegistry from "./gamm/v1beta1/tx.registry";
import * as osmosisLockupTxAmino from "./lockup/tx.amino";
import * as osmosisLockupTxRegistry from "./lockup/tx.registry";
import * as osmosisPoolmanagerV1beta1TxAmino from "./poolmanager/v1beta1/tx.amino";
import * as osmosisPoolmanagerV1beta1TxRegistry from "./poolmanager/v1beta1/tx.registry";
import * as osmosisSuperfluidTxAmino from "./superfluid/tx.amino";
import * as osmosisSuperfluidTxRegistry from "./superfluid/tx.registry";
export const osmosisAminoConverters = {
  ...osmosisConcentratedliquidityPoolmodelConcentratedTxAmino.AminoConverter,
  ...osmosisConcentratedliquidityTxAmino.AminoConverter,
  ...osmosisGammPoolmodelsBalancerTxTxAmino.AminoConverter,
  ...osmosisGammPoolmodelsStableswapTxAmino.AminoConverter,
  ...osmosisGammV1beta1TxAmino.AminoConverter,
  ...osmosisLockupTxAmino.AminoConverter,
  ...osmosisPoolmanagerV1beta1TxAmino.AminoConverter,
  ...osmosisSuperfluidTxAmino.AminoConverter,
};
export const osmosisProtoRegistry: ReadonlyArray<[string, GeneratedType]> = [
  ...osmosisConcentratedliquidityPoolmodelConcentratedTxRegistry.registry,
  ...osmosisConcentratedliquidityTxRegistry.registry,
  ...osmosisGammPoolmodelsBalancerTxTxRegistry.registry,
  ...osmosisGammPoolmodelsStableswapTxRegistry.registry,
  ...osmosisGammV1beta1TxRegistry.registry,
  ...osmosisLockupTxRegistry.registry,
  ...osmosisPoolmanagerV1beta1TxRegistry.registry,
  ...osmosisSuperfluidTxRegistry.registry,
];
export const getSigningOsmosisClientOptions = ({
  defaultTypes = defaultRegistryTypes,
}: {
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
} = {}): {
  registry: Registry;
  aminoTypes: AminoTypes;
} => {
  const registry = new Registry([...defaultTypes, ...osmosisProtoRegistry]);
  const aminoTypes = new AminoTypes({
    ...osmosisAminoConverters,
  });
  return {
    registry,
    aminoTypes,
  };
};
export const getSigningOsmosisClient = async ({
  rpcEndpoint,
  signer,
  defaultTypes = defaultRegistryTypes,
}: {
  rpcEndpoint: string | HttpEndpoint;
  signer: OfflineSigner;
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
}) => {
  const { registry, aminoTypes } = getSigningOsmosisClientOptions({
    defaultTypes,
  });
  const client = await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    signer,
    {
      registry,
      aminoTypes,
    }
  );
  return client;
};
