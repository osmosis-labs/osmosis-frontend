import { Hash } from "@keplr-wallet/crypto";
import { Dec, IntPretty } from "@keplr-wallet/unit";
import { Buffer } from "buffer";
import { observer } from "mobx-react-lite";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

import { useStore } from "../../stores";

export const GAME_CONFIG = {
  PIXEL_SIZE: 30,
  PIXEL_WIDTH: 250,
  PIXEL_HEIGHT: 250,
  SIDE_BAR_WIDTH: 206,
  CANVAS_SIZE: 30 * 250,
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

const focusScale = 1;

const Pixels: NextPage = observer(function () {
  const { queryOsmoPixels } = useStore();
  const router = useRouter();

  const [pixelIndex, setPixelIndex] = useState([-1, -1]);

  const [colorIndex, setColorIndex] = useState(0);

  const tempMousePosition = useRef([0, 0]);

  const initOnce = useRef(false);

  useEffect(() => {
    if (router.isReady && !initOnce.current) {
      if (
        router.query.x &&
        router.query.y &&
        typeof router.query.x === "string" &&
        typeof router.query.y === "string"
      ) {
        const numX = parseInt(router.query.x) - 1;
        const numY = parseInt(router.query.y) - 1;
        if (!Number.isNaN(numX) && !Number.isNaN(numY)) {
          setPixelIndex([numX, numY]);

          if (transformWrapperRef.current) {
            const coordinate = getZoomCoordinate(numX, numY, focusScale);

            transformWrapperRef.current.setTransform(
              coordinate.x,
              coordinate.y,
              coordinate.scale
            );
          }
        }
      } else {
        // If can't get valid x,y from query string,
        // move the user to random position.
        // However, it is difficult to deal with here because of the issues caused by hydration of nextjs.
        // For now, temporarily use setTimeout to solve it.
        setTimeout(() => {
          if (transformWrapperRef.current) {
            const x = Math.floor(Math.random() * GAME_CONFIG.PIXEL_WIDTH);
            const y = Math.floor(Math.random() * GAME_CONFIG.PIXEL_HEIGHT);

            const coordinate = getZoomCoordinate(x, y, focusScale);

            transformWrapperRef.current.setTransform(
              coordinate.x,
              coordinate.y,
              coordinate.scale
            );
          }
        }, 10);
      }

      if (router.query.color && typeof router.query.color === "string") {
        const numColor = parseInt(router.query.color);
        if (!Number.isNaN(numColor)) {
          setColorIndex(numColor);
        }
      }

      initOnce.current = true;
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (pixelIndex[0] >= 0 && pixelIndex[1] >= 0 && colorIndex >= 0) {
      const pathNameWithQueryParams = `${router.pathname}?x=${
        pixelIndex[0] + 1
      }&y=${pixelIndex[1] + 1}&color=${colorIndex}`;
      router.replace(pathNameWithQueryParams);
    }
  }, [pixelIndex, colorIndex, router]);

  const transformWrapperRef = useRef<ReactZoomPanPinchRef | null>(null);
  // canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const lastDrawnPixelsData = useRef<string>("");

  useEffect(() => {
    if (queryOsmoPixels.queryPixels.response) {
      const resHash = Buffer.from(
        Hash.sha256(
          Buffer.from(JSON.stringify(queryOsmoPixels.queryPixels.response.data))
        )
      ).toString("hex");

      if (lastDrawnPixelsData.current === resHash) {
        return;
      }

      const pixelCanvas = canvasRef.current?.getContext("2d");
      if (!pixelCanvas) {
        return;
      }

      const pixels = queryOsmoPixels.queryPixels.response.data;

      for (const xStr of Object.keys(pixels)) {
        const x = parseInt(xStr);
        if (!Number.isNaN(x)) {
          const yPixels = pixels[x] ?? {};
          for (const yStr of Object.keys(yPixels)) {
            const y = parseInt(yStr);
            if (!Number.isNaN(y)) {
              const color = yPixels[y];
              if (color != null && color >= 0 && color < COLOR_SET.length) {
                pixelCanvas.fillStyle = COLOR_SET[color];
                pixelCanvas.fillRect(
                  x * GAME_CONFIG.PIXEL_SIZE,
                  y * GAME_CONFIG.PIXEL_SIZE,
                  GAME_CONFIG.PIXEL_SIZE,
                  GAME_CONFIG.PIXEL_SIZE
                );
              }
            }
          }
        }
      }

      lastDrawnPixelsData.current = resHash;
    }
  }, [queryOsmoPixels.queryPixels.response]);

  const getZoomCoordinate = (x: number, y: number, scale?: number) => {
    if (
      canvasRef.current &&
      transformWrapperRef.current &&
      transformWrapperRef.current.instance.wrapperComponent
    ) {
      const wrapperRect =
        transformWrapperRef.current.instance.wrapperComponent.getBoundingClientRect();

      const currentScale = transformWrapperRef.current.state.scale;
      if (!scale) {
        scale = currentScale;
      }

      return {
        x:
          -((x + 0.5) * GAME_CONFIG.PIXEL_SIZE) * scale + wrapperRect.width / 2,
        y:
          -((y + 0.5) * GAME_CONFIG.PIXEL_SIZE) * scale +
          wrapperRect.height / 2,
        scale,
      };
    }

    return { x: 0, y: 0, scale: 1 };
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
      const coordinate = getZoomCoordinate(
        pixelIndex[0],
        pixelIndex[1],
        focusScale
      );
      setTransform(coordinate.x, coordinate.y, coordinate.scale);
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

  const status = queryOsmoPixels.queryStatus;

  return (
    <main>
      <NextSeo
        title="Osmosis Pixels"
        description="Play the pixels game on Osmosis - the leading decentralized Cosmos exchange"
      />
      <div className="h-screen w-full bg-osmoverse-900">
        <div className="pointer-events-none absolute top-10 left-1/2 z-[11]  flex items-center rounded-lg bg-wosmongton-200 py-2 px-8">
          {`${new IntPretty(
            new Dec(status.response?.data.numDots ?? 0)
          )} pixels placed`}
        </div>
        <TransformWrapper
          ref={transformWrapperRef}
          initialScale={1}
          centerZoomedOut={true}
          minScale={0.2}
          limitToBounds={true}
          maxScale={12}
        >
          {({ zoomOut, zoomIn, setTransform }) => {
            return (
              <React.Fragment>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "end",
                    alignItems: "center",
                    position: "absolute",
                    top: "36px",
                    zIndex: "49",
                    pointerEvents: "none",
                    width: "80%",
                    height: "48px",
                    backgroundColor: "transparent",
                  }}
                >
                  <div
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                      pointerEvents: "all",
                    }}
                    className={"bg-wosmongton-200"}
                    onClick={() => zoomOut()}
                  >
                    -
                  </div>

                  <div style={{ width: "10px" }} />
                  <div
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                      pointerEvents: "all",
                    }}
                    className={"bg-wosmongton-200"}
                    onClick={() => zoomIn()}
                  >
                    +
                  </div>
                </div>
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                >
                  {pixelIndex[0] >= 0 && pixelIndex[1] >= 0 ? (
                    <div
                      className="absolute top-0 left-0"
                      style={{
                        width: `${GAME_CONFIG.PIXEL_SIZE}px`,
                        height: `${GAME_CONFIG.PIXEL_SIZE}px`,
                        outline: "solid #5D5FEF 6px",
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
              </React.Fragment>
            );
          }}
        </TransformWrapper>
        <div className="relative">
          <div className="pointer-events-none absolute bottom-[40px] left-1/2 z-[11] flex -translate-x-1/2 items-center rounded-lg bg-wosmongton-200 py-2 px-8">
            Pixels has ended. Thank you for playing.
          </div>
        </div>
      </div>
    </main>
  );
});

export default Pixels;
