import type {
  WormholeConnectConfig,
  WormholeConnectPartialTheme,
} from "@wormhole-foundation/wormhole-connect";
import dynamic from "next/dynamic";
import { FunctionComponent } from "react";

import { Spinner } from "~/components/loaders";

const WormholeConnect = dynamic(
  () =>
    import("@wormhole-foundation/wormhole-connect").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    ),
  }
);

const config: WormholeConnectConfig = {
  networks: ["ethereum", "solana"],
};

const theme: WormholeConnectPartialTheme = {
  background: {
    default: "#212b4a",
  },
};

const Wormhole: FunctionComponent = () => {
  return <WormholeConnect config={config} theme={theme} />;
};

export default Wormhole;
