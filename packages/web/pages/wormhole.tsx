import WormholeConnect, {
  WormholeConnectConfig,
  WormholeConnectPartialTheme,
} from "@wormhole-foundation/wormhole-connect";
import { NextPage } from "next";

const config: WormholeConnectConfig = {
  networks: ["ethereum", "solana"],
};

const theme: WormholeConnectPartialTheme = {
  background: {
    default: "#212b4a",
  },
};

const Wormhole: NextPage = () => {
  return <WormholeConnect config={config} theme={theme} />;
};

export default Wormhole;
