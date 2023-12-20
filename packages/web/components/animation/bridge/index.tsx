import classNames from "classnames";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { CustomClasses } from "~/components/types";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/** Illustrates a bespoke or IBC bridge transfer for user info. */
export const BridgeAnimation = (props: CustomClasses) => {
  const { className } = props;

  // dynamic load JSON animation data - keep base bundle small
  const [animData, setAnimData] = useState<object | null>(null);
  useEffect(() => {
    if (!animData) {
      import("./lottie-transfer.json").then(setAnimData);
    }
  }, [animData]);

  return (
    <div
      className={classNames(
        "absolute left-1/2 top-[22px] -translate-x-1/2 transform transition-opacity duration-300 md:top-[8px] sm:left-[45%]",
        className
      )}
    >
      <Lottie
        animationData={animData}
        autoplay
        loop
        className="h-[85px] w-[400px] md:w-[400px] sm:w-[120%]"
      />
    </div>
  );
};
