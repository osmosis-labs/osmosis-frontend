import { EthereumChainInfo } from "@osmosis-labs/utils";
import { createConfig } from "wagmi";

import { createWagmiConnectors } from "~/config/wagmi-connectors";
import { getClientEvmRpcTransport } from "~/utils/evm-rpc";

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export const wagmiConfig = createConfig({
  chains: EthereumChainInfo,
  transports: Object.fromEntries(
    EthereumChainInfo.map((info) => [info.id, getClientEvmRpcTransport(info)])
  ),
  connectors: createWagmiConnectors(),
});

export type EthereumChainIds = (typeof wagmiConfig)["chains"][number]["id"];
