import { FunctionComponent } from "react";
import Image from "next/image";

import { DenomImageProps } from "./types";

export const DenomImage: FunctionComponent<DenomImageProps> = ({
  denom,
  size = 24,
}) => {
  return (
    <>
      {denom.coinImageUrl ? (
        <Image
          src={denom.coinImageUrl}
          alt="token icon"
          width={size}
          height={size}
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="bg-osmoverse-700 rounded-full flex items-center justify-center"
        >
          {denom.coinDenom[0].toUpperCase()}
        </div>
      )}
    </>
  );
};
