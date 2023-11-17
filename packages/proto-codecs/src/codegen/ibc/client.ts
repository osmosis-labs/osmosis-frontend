//@ts-nocheck
import { GeneratedType, OfflineSigner, Registry } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  defaultRegistryTypes,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { HttpEndpoint } from "@cosmjs/tendermint-rpc";

import * as ibcApplicationsTransferV1TxAmino from "./applications/transfer/v1/tx.amino";
import * as ibcApplicationsTransferV1TxRegistry from "./applications/transfer/v1/tx.registry";
import * as ibcCoreClientV1TxAmino from "./core/client/v1/tx.amino";
import * as ibcCoreClientV1TxRegistry from "./core/client/v1/tx.registry";
export const ibcAminoConverters = {
  ...ibcApplicationsTransferV1TxAmino.AminoConverter,
  ...ibcCoreClientV1TxAmino.AminoConverter,
};
export const ibcProtoRegistry: ReadonlyArray<[string, GeneratedType]> = [
  ...ibcApplicationsTransferV1TxRegistry.registry,
  ...ibcCoreClientV1TxRegistry.registry,
];
export const getSigningIbcClientOptions = ({
  defaultTypes = defaultRegistryTypes,
}: {
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
} = {}): {
  registry: Registry;
  aminoTypes: AminoTypes;
} => {
  const registry = new Registry([...defaultTypes, ...ibcProtoRegistry]);
  const aminoTypes = new AminoTypes({
    ...ibcAminoConverters,
  });
  return {
    registry,
    aminoTypes,
  };
};
export const getSigningIbcClient = async ({
  rpcEndpoint,
  signer,
  defaultTypes = defaultRegistryTypes,
}: {
  rpcEndpoint: string | HttpEndpoint;
  signer: OfflineSigner;
  defaultTypes?: ReadonlyArray<[string, GeneratedType]>;
}) => {
  const { registry, aminoTypes } = getSigningIbcClientOptions({
    defaultTypes,
  });
  const client = await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    signer,
    {
      registry: registry as any,
      aminoTypes,
    }
  );
  return client;
};
