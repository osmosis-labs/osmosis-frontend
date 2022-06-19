import React, { useState } from "react";
import Image from "next/image";

type PaletteProps = {
  colorSet: string[];

  sidebarWidth: number;
  maxColors: number;
  x: number;
  y: number;
  setColorIndex: (index: number) => void;
  doneEnabled: boolean;
  clickDone: Function;
};

const Palette = ({
  colorSet,

  sidebarWidth,
  maxColors,
  x,
  y,
  setColorIndex,
  doneEnabled,
  clickDone,
}: PaletteProps) => {
  const [selectedColor, setSelectedColor] = useState(0);

  const colorOnClick = (index: number) => {
    setSelectedColor(index);
    setColorIndex(index);
  };

  return (
    <div
      className="absolute pointer-events-none h-auto bottom-[40px] z-[11]"
      style={{
        width: `calc(100% - ${sidebarWidth}px)`,
      }}
    >
      <div
        className="w-[524px] h-[172px] rounded-[16px] bg-card p-[20px] mx-auto border border-2 border-enabledGold"
        style={{
          pointerEvents: "all",
        }}
      >
        <div className="flex justify-between w-full h-auto mb-[5px]">
          <div className="font-subtitle1 text-sm my-auto">
            {doneEnabled ? `(${x + 1}, ${y + 1})` : " "}
          </div>
          <div
            className={`cursor-pointer ${
              doneEnabled ? "text-secondary-200" : "text-secondary-600"
            } font-subtitle1 text-base my-auto`}
            onClick={() => {
              if (doneEnabled) {
                clickDone();
              }
            }}
          >
            Done
          </div>
        </div>
        <div
          className="w-full h-auto grid justify-around content-center"
          style={{
            gridTemplateRows: "repeat(2, 50px)",
            gridTemplateColumns: "repeat(8, 1fr)",
          }}
        >
          {colorSet.map((color, idx) => (
            <React.Fragment key={idx}>
              {maxColors > idx ? (
                idx === selectedColor ? (
                  <div
                    className="cursor-pointer w-[36px] h-[36px] rounded-full border-0 m-auto flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <div className="w-[32px] h-[32px] rounded-full border-2 border-black m-auto" />
                  </div>
                ) : (
                  <div
                    className="cursor-pointer w-[36px] h-[36px] rounded-full border-0 m-auto"
                    onClick={() => colorOnClick(idx)}
                    style={{ backgroundColor: color }}
                  />
                )
              ) : (
                <div
                  className="w-[36px] h-[36px] rounded-full bg-transparent m-auto"
                  style={{
                    border: "1px dashed rgba(255, 255, 255, 0.4)",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        {maxColors < 5 ? (
          <div className="relative">
            <a
              className="absolute flex flex-row items-center justify-center w-full rounded-lg text-subtitle1 text-sm bottom-[6px] text-center bg-primary-200 py-[8px]"
              href="https://wallet.keplr.app/#/osmosis/stake"
              target="_blank"
              rel="noopener noreferrer"
            >
              Redelegate to smaller validators to unlock color
              <div className="flex items-center justify-center ml-2">
                <Image
                  alt="link"
                  src="/icons/link-deco-real-white.svg"
                  height={14}
                  width={14}
                />
              </div>
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Palette;
