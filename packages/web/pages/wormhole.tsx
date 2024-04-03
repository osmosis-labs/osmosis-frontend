import WormholeConnect, {
  WormholeConnectConfig,
  WormholeConnectPartialTheme,
} from "@wormhole-foundation/wormhole-connect";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

const config: WormholeConnectConfig = {
  networks: ["ethereum", "solana"],
};

const theme: WormholeConnectPartialTheme = {
  background: {
    default: "#212b4a",
  },
};

const Wormhole: FunctionComponent = observer(() => {
  return <WormholeConnect config={config} theme={theme} />;
});

export default Wormhole;
