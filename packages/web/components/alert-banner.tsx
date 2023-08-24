import Image from "next/image";
import React from "react";

export const AlertBanner: React.FC<{
  image?: string;
  title: string;
  subtitle: string;
}> = ({ image, title, subtitle }) => {
  return (
    <div className="z-50 flex flex h-[5rem] w-full items-center gap-8 rounded-[24px] bg-gradient-alert py-2 px-10">
      {image && <Image src={image} alt="moving-on-up" width={80} height={80} />}
      <div className="flex w-full flex-col gap-1 py-2.5">
        <h6 className="font-semibold">{title}</h6>
        <div className="flex gap-3">
          <p className="text-sm font-light">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
