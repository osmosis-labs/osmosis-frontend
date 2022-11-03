import Image from "next/image";
import React from "react";
import { Button } from "../buttons";

type PaletteProps = {
  colorSet: string[];

  sidebarWidth: number;
  maxColors: number;
  x: number;
  y: number;
  colorIndex: number;
  setColorIndex: (index: number) => void;
  doneEnabled: boolean;
  clickDone: Function;
  openShareModal: () => void;
};

const Palette = ({
  colorSet,

  sidebarWidth,
  maxColors,
  x,
  y,
  colorIndex,
  setColorIndex,
  doneEnabled,
  clickDone,
  openShareModal,
}: PaletteProps) => {
  const colorOnClick = (index: number) => {
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
        className="w-full max-w-[424px] rounded-[16px] bg-osmoverse-700 p-[20px] mx-auto"
        style={{
          pointerEvents: "all",
        }}
      >
        <div className="flex justify-between h-auto mx-2 mb-[5px]">
          <div className="font-subtitle1 my-auto">
            {doneEnabled ? `(${x + 1}, ${y + 1})` : " "}
          </div>
          <div
            className={`cursor-pointer ${
              doneEnabled ? "text-rust-200" : "text-rust-600"
            } font-subtitle1 text-base my-auto`}
            onClick={() => {
              openShareModal();
            }}
          >
            Share Location
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
                idx === colorIndex ? (
                  <div className="cursor-pointer w-[36px] h-[36px] rounded-full border-0 m-auto flex items-center justify-center bg-white-full">
                    <div
                      className="w-[32px] h-[32px] rounded-full border-2 border-black m-auto"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                ) : (
                  <div
                    className="cursor-pointer w-[28px] h-[28px] rounded-full border-0 m-auto"
                    onClick={() => colorOnClick(idx)}
                    style={{ backgroundColor: color }}
                  />
                )
              ) : (
                <div
                  className="w-[28px] h-[28px] rounded-full bg-transparent m-auto"
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
              className="absolute flex flex-row items-center justify-center w-full rounded-lg text-subtitle1 tracking-tighter text-xs bottom-[6px] text-center py-[8px]"
              href="https://wallet.keplr.app/chains/osmosis"
              target="_blank"
              rel="noopener noreferrer"
            >
              Redelegate to bottom 2/3 validators to unlock color
              <div className="flex items-center justify-center ml-1">
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
        <Button
          size="sm"
          className="w-full mt-4 !py-2"
          onClick={() => {
            if (doneEnabled) {
              clickDone();
            }
          }}
        >
          🌜 fkn sned it 🌛
        </Button>
      </div>
    </div>
  );
};

export default Palette;
