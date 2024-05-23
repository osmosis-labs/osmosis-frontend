import { createConfig, http } from "wagmi";
import {
  arbitrum,
  avalanche,
  bsc,
  fantom,
  filecoin,
  mainnet,
  moonbeam,
  polygon,
  sepolia,
} from "wagmi/chains";
import { metaMask, walletConnect } from "wagmi/connectors";

import { WALLETCONNECT_PROJECT_KEY } from "~/config/env";

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export const wagmiConfig = createConfig({
  chains: [
    mainnet,
    sepolia,
    avalanche,
    bsc,
    fantom,
    moonbeam,
    polygon,
    filecoin,
    arbitrum,
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [avalanche.id]: http(),
    [bsc.id]: http(),
    [fantom.id]: http(),
    [moonbeam.id]: http(),
    [polygon.id]: http(),
    [filecoin.id]: http(),
    [arbitrum.id]: http(),
  },
  connectors: [
    metaMask(),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_KEY ?? "" }),
  ],
});
