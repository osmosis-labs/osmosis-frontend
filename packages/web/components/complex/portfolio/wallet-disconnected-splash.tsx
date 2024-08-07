import Image from "next/image";
import { FunctionComponent } from "react";

export const WalletDisconnectedSplash: FunctionComponent = () => (
  <div className="relative w-full">
    <Image alt="home" src="/images/chart.png" fill />
    <Image
      className="relative top-10 mx-auto"
      alt="home"
      src="/images/osmosis-home-fg-coins.svg"
      width={624}
      height={298}
    />
  </div>
);
