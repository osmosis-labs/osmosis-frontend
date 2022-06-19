import React, { useCallback, useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Palette from "../../components/pixels/pallete";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { WalletStatus } from "@keplr-wallet/stores";
import { DecUtils } from "@keplr-wallet/unit";

export const GAME_CONFIG = {
  PIXEL_SIZE: 25,
  PIXEL_WIDTH: 500,
  PIXEL_HEIGHT: 500,
  SIDE_BAR_WIDTH: 206,
  CANVAS_SIZE: 2000,
};

export const COLOR_SET = [
  "#FFF",
  "#D4D7D9",
  "#898D90",
  "#000",
  "#FF4500",
  "#FFA800",
  "#FFD635",
  "#00A368",
  "#7EED56",
  "#2450A4",
  "#3690EA",
  "#51E9F4",
  "#811E9F",
  "#B44AC0",
  "#FF99AA",
  "#9C6926",
];

const Pixels: NextPage = observer(function () {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.osmosis.chainId);

  const [pixelList] = useState(() =>
    Array.from(Array(GAME_CONFIG.PIXEL_WIDTH), () =>
      Array.from(
        Array(GAME_CONFIG.PIXEL_HEIGHT),
        () => COLOR_SET[Math.floor(Math.random() * COLOR_SET.length)]
      )
    )
  );
  const [pixelIndex, setPixelIndex] = useState([-1, -1]);
  const [focusScale] = useState(4);

  const [colorIndex, setColorIndex] = useState(0);

  const tempMousePosition = useRef([0, 0]);

  // canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // const loadImg = useCallback(() => {
  //   const pixelCanvas = canvasRef.current?.getContext("2d");
  //   if (!pixelCanvas) {
  //     return;
  //   }
  //
  //   for (let i = 0; i < pixelList.length; i++) {
  //     for (let j = 0; j < pixelList[i].length; j++) {
  //       pixelCanvas.fillStyle = pixelList[i][j];
  //       pixelCanvas.fillRect(
  //         i * GAME_CONFIG.PIXEL_SIZE,
  //         j * GAME_CONFIG.PIXEL_SIZE,
  //         GAME_CONFIG.PIXEL_SIZE,
  //         GAME_CONFIG.PIXEL_SIZE
  //       );
  //     }
  //   }
  // }, []);

  const getZoomCoordinate = () => {
    let pixel = 8000 / GAME_CONFIG.PIXEL_HEIGHT;
    const viewWidth = (window.innerWidth - GAME_CONFIG.SIDE_BAR_WIDTH) / 33;
    const viewHeight = window.innerHeight / 36;

    const x = -(pixelIndex[0] * pixel - viewWidth * pixel);
    const y = -(pixelIndex[1] * pixel - viewHeight * pixel);
    return { x: x, y: y };
  };

  const getMousePos = (e: {
    readonly clientX: number;
    readonly clientY: number;
  }) => {
    if (canvasRef.current) {
      let rect = canvasRef.current.getBoundingClientRect();
      let width = rect.right - rect.left;
      let height = rect.bottom - rect.top;
      let userX = e.clientX - rect.x;
      let userY = e.clientY - rect.y;

      const x = userX * (GAME_CONFIG.PIXEL_WIDTH / width);
      const y = userY * (GAME_CONFIG.PIXEL_HEIGHT / height);

      return { x: Math.floor(x), y: Math.floor(y) };
    }
  };

  // handler
  const onClickHandler = useCallback((e: MouseEvent) => {
    e.preventDefault();

    const cursor = getMousePos(e);
    const beforeX = e.clientX;
    const beforeY = e.clientY;

    if (canvasRef.current && cursor) {
      canvasRef.current.addEventListener(
        "mouseup",
        (e2: MouseEvent) => {
          const afterX = e2.clientX;
          const afterY = e2.clientY;

          if (beforeX === afterX && afterY === beforeY) {
            const newPixel = [cursor.x, cursor.y];
            setPixelIndex(newPixel);
          }
        },
        {
          once: true,
        }
      );
    }
  }, []);

  // action
  const handleMouseDown = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    tempMousePosition.current = [x, y];
  };

  const handleClicked = (e: React.MouseEvent, setTransform: Function) => {
    const cursorX = e.clientX;
    const cursorY = e.clientY;

    if (
      tempMousePosition.current[0] === cursorX &&
      tempMousePosition.current[1] === cursorY
    ) {
      const coordinate = getZoomCoordinate();
      setTransform(coordinate.x, coordinate.y, focusScale);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      canvas.addEventListener("mousedown", onClickHandler);

      return () => {
        canvas.removeEventListener("mousedown", onClickHandler);
      };
    }
  }, [onClickHandler]);

  useEffect(() => {
    canvasRef.current?.setAttribute(
      "width",
      String(GAME_CONFIG.PIXEL_WIDTH * GAME_CONFIG.PIXEL_SIZE)
    );
    canvasRef.current?.setAttribute(
      "height",
      String(GAME_CONFIG.PIXEL_HEIGHT * GAME_CONFIG.PIXEL_SIZE)
    );
    if (canvasRef.current) {
      canvasRef.current.style.backgroundColor = "#fff";
    }
  }, []);

  return (
    <main>
      <div className="w-full h-screen">
        <TransformWrapper
          initialScale={2}
          centerZoomedOut={true}
          minScale={0.4}
          limitToBounds={true}
          maxScale={10}
        >
          {({ setTransform }) => {
            return (
              <React.Fragment>
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                >
                  {pixelIndex[0] >= 0 && pixelIndex[1] >= 0 ? (
                    <div
                      className="absolute top-0 left-0"
                      style={{
                        width: "4px",
                        height: "4px",
                        outline: "solid #5D5FEF 1px",
                        backgroundColor: COLOR_SET[colorIndex],
                        transform: `translate(${pixelIndex[0] * 100}%, ${
                          pixelIndex[1] * 100
                        }%)`,
                        transition: "all 0.5s",
                        zIndex: 1000,
                      }}
                    />
                  ) : null}
                  <canvas
                    className="ring-2 ring-black"
                    style={{
                      width: GAME_CONFIG.CANVAS_SIZE,
                      height: GAME_CONFIG.CANVAS_SIZE,
                    }}
                    ref={canvasRef}
                    onClick={(e) => handleClicked(e, setTransform)}
                    onMouseDown={(e) => handleMouseDown(e)}
                    onDoubleClick={() => {}}
                  />
                </TransformComponent>
                <Palette
                  colorSet={COLOR_SET}
                  sidebarWidth={GAME_CONFIG.SIDE_BAR_WIDTH}
                  maxColors={16}
                  x={pixelIndex[0]}
                  y={pixelIndex[1]}
                  setColorIndex={setColorIndex}
                  clickDone={async () => {
                    if (account.walletStatus !== WalletStatus.Loaded) {
                      await account.init();
                    }

                    if (account.walletStatus !== WalletStatus.Loaded) {
                      throw new Error("Failed to load account");
                    }

                    try {
                      await account.sendToken(
                        DecUtils.getTenExponentN(
                          -chainStore.osmosis.stakeCurrency.coinDecimals
                        ).toString(),
                        chainStore.osmosis.stakeCurrency,
                        account.bech32Address,
                        `osmopixel (${pixelIndex[0]},${pixelIndex[1]},${colorIndex})`,
                        {
                          amount: [
                            {
                              denom:
                                chainStore.osmosis.stakeCurrency
                                  .coinMinimalDenom,
                              amount: "0",
                            },
                          ],
                        },
                        {
                          preferNoSetFee: true,
                          preferNoSetMemo: true,
                        }
                      );
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                  doneEnabled={pixelIndex[0] >= 0 && pixelIndex[1] >= 0}
                />
              </React.Fragment>
            );
          }}
        </TransformWrapper>
      </div>
    </main>
  );
});

export default Pixels;
