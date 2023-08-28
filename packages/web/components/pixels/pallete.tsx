import Image from "next/image";
import React from "react";

import { Button } from "~/components/buttons";

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
      className="pointer-events-none absolute bottom-[40px] z-[11] h-auto"
      style={{
        width: `calc(100% - ${sidebarWidth}px)`,
      }}
    >
      <div
        className="mx-auto w-full max-w-[424px] rounded-[16px] bg-osmoverse-700 p-[20px]"
        style={{
          pointerEvents: "all",
        }}
      >
        <div className="mx-2 mb-[5px] flex h-auto justify-between">
          <div className="my-auto font-subtitle1">
            {doneEnabled ? `(${x + 1}, ${y + 1})` : " "}
          </div>
          <div
            className={`cursor-pointer ${
              doneEnabled ? "text-rust-200" : "text-rust-600"
            } my-auto font-subtitle1 text-base`}
            onClick={() => {
              openShareModal();
            }}
          >
            Share Location
          </div>
        </div>
        <div
          className="grid h-auto w-full content-center justify-around"
          style={{
            gridTemplateRows: "repeat(2, 50px)",
            gridTemplateColumns: "repeat(8, 1fr)",
          }}
        >
          {colorSet.map((color, idx) => (
            <React.Fragment key={idx}>
              {maxColors > idx ? (
                idx === colorIndex ? (
                  <div className="m-auto flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full border-0 bg-white-full">
                    <div
                      className="m-auto h-[32px] w-[32px] rounded-full border-2 border-black"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                ) : (
                  <div
                    className="m-auto h-[28px] w-[28px] cursor-pointer rounded-full border-0"
                    onClick={() => colorOnClick(idx)}
                    style={{ backgroundColor: color }}
                  />
                )
              ) : (
                <div
                  className="m-auto h-[28px] w-[28px] rounded-full bg-transparent"
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
              className="absolute bottom-[6px] flex w-full items-center justify-center rounded-lg py-[8px] text-center text-subtitle1 text-xs tracking-tighter"
              href="https://wallet.keplr.app/chains/osmosis"
              target="_blank"
              rel="noopener noreferrer"
            >
              Redelegate to bottom 2/3 validators to unlock color
              <div className="ml-1 flex items-center justify-center">
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
          className="mt-4 w-full !py-2"
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
