import React from "react";

export const AlertBanner: React.FC<{
  image?: JSX.Element;
  title: string;
  subtitle: string;
}> = ({ image, title, subtitle }) => {
  return (
    <div className="relative z-50 flex flex h-[5rem] w-full items-center gap-8 rounded-3xl bg-gradient-alert py-2 px-10">
      {image}
      <div className="z-50 flex w-full flex-col gap-1 py-2.5">
        <h6 className="text-center font-semibold">{title}</h6>
        <div className="flex gap-3">
          <p className="w-full text-center text-sm font-light">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
