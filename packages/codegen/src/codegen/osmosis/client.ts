import { OfflineSigner, GeneratedType, Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes, AminoTypes, SigningStargateClient } from "@cosmjs/stargate";
import * as osmosisGammPoolmodelsBalancerTxTxRegistry from "./gamm/pool-models/balancer/tx/tx.registry";
import * as osmosisGammPoolmodelsStableswapTxRegistry from "./gamm/pool-models/stableswap/tx.registry";
import * as osmosisGammV1beta1TxRegistry from "./gamm/v1beta1/tx.registry";
import * as osmosisIncentivesTxRegistry from "./incentives/tx.registry";
import * as osmosisLockupTxRegistry from "./lockup/tx.registry";
import * as osmosisStreamswapV1TxRegistry from "./streamswap/v1/tx.registry";
import * as osmosisSuperfluidTxRegistry from "./superfluid/tx.registry";
import * as osmosisTokenfactoryV1beta1TxRegistry from "./tokenfactory/v1beta1/tx.registry";
import * as osmosisGammPoolmodelsBalancerTxTxAmino from "./gamm/pool-models/balancer/tx/tx.amino";
import * as osmosisGammPoolmodelsStableswapTxAmino from "./gamm/pool-models/stableswap/tx.amino";
import * as osmosisGammV1beta1TxAmino from "./gamm/v1beta1/tx.amino";
import * as osmosisIncentivesTxAmino from "./incentives/tx.amino";
import * as osmosisLockupTxAmino from "./lockup/tx.amino";
import * as osmosisStreamswapV1TxAmino from "./streamswap/v1/tx.amino";
import * as osmosisSuperfluidTxAmino from "./superfluid/tx.amino";
import * as osmosisTokenfactoryV1beta1TxAmino from "./tokenfactory/v1beta1/tx.amino";
export const getSigningOsmosisClientOptions = ({
  defaultTypes = defaultRegistryTypes
}: {
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
} = {}): {
  registry: Registry;
  aminoTypes: AminoTypes;
} => {
  const registry = new Registry([...defaultTypes, ...osmosisGammPoolmodelsBalancerTxTxRegistry.registry, ...osmosisGammPoolmodelsStableswapTxRegistry.registry, ...osmosisGammV1beta1TxRegistry.registry, ...osmosisIncentivesTxRegistry.registry, ...osmosisLockupTxRegistry.registry, ...osmosisStreamswapV1TxRegistry.registry, ...osmosisSuperfluidTxRegistry.registry, ...osmosisTokenfactoryV1beta1TxRegistry.registry]);
  const aminoTypes = new AminoTypes({ ...osmosisGammPoolmodelsBalancerTxTxAmino.AminoConverter,
    ...osmosisGammPoolmodelsStableswapTxAmino.AminoConverter,
    ...osmosisGammV1beta1TxAmino.AminoConverter,
    ...osmosisIncentivesTxAmino.AminoConverter,
    ...osmosisLockupTxAmino.AminoConverter,
    ...osmosisStreamswapV1TxAmino.AminoConverter,
    ...osmosisSuperfluidTxAmino.AminoConverter,
    ...osmosisTokenfactoryV1beta1TxAmino.AminoConverter
  });
  return {
    registry,
    aminoTypes
  };
};
export const getSigningOsmosisClient = async ({
  rpcEndpoint,
  signer,
  defaultTypes = defaultRegistryTypes
}: {
  rpcEndpoint: string;
  signer: OfflineSigner;
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
}) => {
  const {
    registry,
    aminoTypes
  } = getSigningOsmosisClientOptions({
    defaultTypes
  });
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, signer, {
    registry,
    aminoTypes
  });
  return client;
};