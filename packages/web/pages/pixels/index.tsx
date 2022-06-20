import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { NextPage } from "next";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Palette from "../../components/pixels/pallete";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { WalletStatus } from "@keplr-wallet/stores";
import { Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import { Hash } from "@keplr-wallet/crypto";
import { Buffer } from "buffer/";
import Image from "next/image";
import { ModalBase, ModalBaseProps } from "../../modals";
import { Button } from "../../components/buttons";
import { useRouter } from "next/router";
import { isNumber } from "../../hooks/data/types";

export const GAME_CONFIG = {
  PIXEL_SIZE: 30,
  PIXEL_WIDTH: 250,
  PIXEL_HEIGHT: 250,
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

const PixelsRuleModal: FunctionComponent<ModalBaseProps> = (props) => {
  return (
    <ModalBase {...props} isOpen={props.isOpen} title="Rules">
      <div className="my-5">
        <p>
          🧪 Only users with more than 1 OSMO on birthday epoch can participate
        </p>
        <p>🎨 Stake to the lower 2/3 validators to unlock more colors</p>
        <p>
          ⏱ Once you place a pixel, you must wait 50 blocks to place another
        </p>
      </div>
    </ModalBase>
  );
};

const ShareModal: FunctionComponent<
  Omit<ModalBaseProps, "isOpen"> & {
    shareInfo:
      | {
          numDots: number;
          numAccounts: number;
        }
      | undefined;
  }
> = (props) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timeoutId = setTimeout(() => {
        setIsCopied(false);
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isCopied]);

  return (
    <ModalBase {...props} isOpen={props.shareInfo != null}>
      <div className="flex justify-center text-2xl mb-2">👋</div>
      <div className="my-5">
        <p className="text-lg text-center">
          {`${(
            props.shareInfo?.numAccounts ?? 0
          ).toLocaleString()} wallets have placed ${(
            props.shareInfo?.numDots ?? 0
          ).toLocaleString()} pixels so far`}
        </p>
      </div>
      <div className="mb-5">
        <p className="text-center text-white-disabled">
          Share this link to fellow Osmonauts so they can join the fun.
        </p>
      </div>
      <div className="flex justify-center">
        <Button
          size="lg"
          type="outline"
          className="flex items-center"
          onClick={async () => {
            await navigator.clipboard.writeText(
              window.location.origin + "/pixels"
            );

            setIsCopied(true);
          }}
        >
          <div className="flex flex-shrink-0 items-center">
            <Image
              alt="copy"
              src="/icons/copy-white.svg"
              height={20}
              width={20}
            />
            <span className="ml-2 flex-shrink-0">
              {isCopied ? "Copied!" : "Copy link"}
            </span>
          </div>
        </Button>
      </div>
    </ModalBase>
  );
};

const Pixels: NextPage = observer(function () {
  const { chainStore, accountStore, queryOsmoPixels } = useStore();
  const router = useRouter();

  const account = accountStore.getAccount(chainStore.osmosis.chainId);

  const [pixelIndex, setPixelIndex] = useState([-1, -1]);
  const [focusScale] = useState(4);

  const [colorIndex, setColorIndex] = useState(0);

  const tempMousePosition = useRef([0, 0]);

  const initPos = () => {
    let pixel = 4000 / GAME_CONFIG.PIXEL_HEIGHT;
    const ranX = Math.floor(Math.random() * 200) + 10;
    const ranY = Math.floor(Math.random() * 200) + 10;

    const x = -(ranX * pixel);
    const y = -(ranY * pixel);

    return { x: x, y: y };
  };

  const firstQueryEffectChecker = useRef(false);

  useEffect(() => {
    if (!!router.query.x && !!router.query.y && !!router.query.color) {
      const numX = Number(router.query.x) - 1;
      const numY = Number(router.query.y) - 1;
      if (isNumber(numX) && isNumber(numY)) {
        setPixelIndex([Number(numX), Number(numY)]);
      }

      const numColor = Number(router.query.color);
      if (isNumber(numColor)) {
        setColorIndex(numColor);
      }
    }
  }, [router.query.x, router.query.y, router.query.color]);

  useEffect(() => {
    if (firstQueryEffectChecker.current) {
      if (pixelIndex[0] >= 0 && pixelIndex[1] >= 0 && colorIndex >= 0) {
        const pathNameWithQueryParams = `${router.pathname}?x=${
          pixelIndex[0] + 1
        }&y=${pixelIndex[1] + 1}&color=${colorIndex}`;
        router.replace(pathNameWithQueryParams);
      }
    } else {
      firstQueryEffectChecker.current = true;
    }
  }, [pixelIndex, colorIndex]);

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

  const getZoomCoordinate = () => {
    let pixel = 8000 / GAME_CONFIG.PIXEL_HEIGHT;
    const viewWidth = (window.innerWidth - GAME_CONFIG.SIDE_BAR_WIDTH) / 72;
    const viewHeight = window.innerHeight / 88;

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

  const permission = queryOsmoPixels.queryPermission.get(account.bech32Address)
    .response?.data;

  const [remainingBlocks, setRemainingBlocks] = useState(0);

  useEffect(() => {
    const remainingBlocks = permission?.remainingBlocks ?? 0;
    setRemainingBlocks(remainingBlocks);

    const intervalId = setInterval(() => {
      setRemainingBlocks((b) => {
        if (b > 0) {
          return b - 1;
        }
        return b;
      });
      // 6.5s
    }, 6500);

    return () => {
      clearInterval(intervalId);
    };
  }, [permission?.remainingBlocks]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (account.bech32Address) {
        queryOsmoPixels.queryPermission.get(account.bech32Address).fetch();
      }
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [account.bech32Address, queryOsmoPixels.queryPermission]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      queryOsmoPixels.queryPixels.fetch();
    }, 25000);

    return () => {
      clearInterval(intervalId);
    };
  }, [queryOsmoPixels.queryPixels]);

  const [showRules, setShowRules] = useState(false);
  const [showShareModal, setShowShareModal] = useState<
    | {
        numDots: number;
        numAccounts: number;
      }
    | undefined
  >(undefined);

  const status = queryOsmoPixels.queryStatus;

  return (
    <main>
      <PixelsRuleModal
        isOpen={showRules}
        onRequestClose={() => {
          setShowRules(false);
        }}
      />
      <ShareModal
        shareInfo={showShareModal}
        onRequestClose={() => setShowShareModal(undefined)}
      />
      <div className="w-full h-screen bg-background">
        <div
          className="absolute pointer-events-none h-auto top-0 z-[11]"
          style={{
            width: `calc(100% - ${GAME_CONFIG.SIDE_BAR_WIDTH}px)`,
          }}
        >
          <Button
            className="pointer-events-auto mt-[2.25rem] ml-[3rem] w-[1.25rem]"
            size="lg"
            onClick={() => {
              setShowRules(true);
            }}
          >
            Rules
          </Button>
        </div>

        <div className="absolute pointer-events-none top-10 left-1/2 z-[11]  py-2 px-8 bg-primary-200 flex items-center rounded-lg">
          {`${new IntPretty(
            new Dec(status.response?.data.numDots ?? 0)
          )} pixels placed`}
        </div>
        <TransformWrapper
          initialScale={2}
          centerZoomedOut={true}
          minScale={0.4}
          limitToBounds={true}
          initialPositionX={initPos().x}
          maxScale={12}
          initialPositionY={initPos().y}
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
                    zIndex: "1000",
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
                    className={"bg-primary-200"}
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
                    className={"bg-primary-200"}
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
                        width: "8px",
                        height: "8px",
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
                {permission &&
                  remainingBlocks > 0 &&
                  permission.permission !== "not_eligible" &&
                  permission.permission !== "none" && (
                    <div
                      className="absolute pointer-events-none h-auto bottom-[40px] z-[11]"
                      style={{
                        width: `calc(100% - ${GAME_CONFIG.SIDE_BAR_WIDTH}px)`,
                      }}
                    >
                      <div className="w-[200px] h-[36px] rounded-[12px] bg-card mx-auto flex items-center justify-center font-subtitle1 text-sm">
                        <div className="mr-1 flex items-center justify-center ">
                          <Image
                            alt=""
                            src="/icons/loading.svg"
                            height={24}
                            width={24}
                          />
                        </div>
                        {`${remainingBlocks} blocks remaining`}
                      </div>
                    </div>
                  )}
                {permission && permission.permission === "not_eligible" && (
                  <div className="absolute pointer-events-none h-auto bottom-[40px] left-1/2 rounded-lg z-[11] py-1.5 px-3.5 bg-error flex items-center">
                    <Image
                      alt="error"
                      src="/icons/info-white-emphasis.svg"
                      height={16}
                      width={16}
                    />
                    <span className="ml-2.5">You are not eligible</span>
                  </div>
                )}
                {permission && permission.permission === "none" && (
                  <a
                    className="absolute h-auto bottom-[40px] left-1/2 rounded-lg z-[11] py-1.5 px-3.5 bg-primary-200 flex items-center"
                    href="https://wallet.keplr.app/#/osmosis/stake"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="mr-2.5">
                      Stake OSMO here to participate
                    </span>
                    <Image
                      src={"/icons/link-deco-real-white.svg"}
                      alt="link"
                      width={12}
                      height={12}
                    />
                  </a>
                )}
                {permission &&
                remainingBlocks <= 0 &&
                permission.permission !== "not_eligible" &&
                permission.permission !== "none" ? (
                  <Palette
                    colorSet={COLOR_SET}
                    sidebarWidth={GAME_CONFIG.SIDE_BAR_WIDTH}
                    maxColors={permission.permission === "multi_color" ? 16 : 4}
                    x={pixelIndex[0]}
                    y={pixelIndex[1]}
                    colorIndex={colorIndex}
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
                          },
                          {
                            onFulfill: () => {
                              // Since the backend processes the block after it is created, it is difficult to perfectly sync.
                              // Therefore, add slight delay.
                              setTimeout(() => {
                                Promise.all([
                                  queryOsmoPixels.queryPixels.waitFreshResponse(),
                                  queryOsmoPixels.queryPermission
                                    .get(account.bech32Address)
                                    .waitFreshResponse(),
                                ])
                                  .then(() => {
                                    setPixelIndex([-1, -1]);

                                    const permission =
                                      queryOsmoPixels.queryPermission.get(
                                        account.bech32Address
                                      ).response;

                                    // If the remaining block is not 0 after sending tx,
                                    // it is assumed that a dot is drawn and show the share modal to user.
                                    if (
                                      permission &&
                                      permission.data.remainingBlocks > 0
                                    ) {
                                      queryOsmoPixels.queryStatus
                                        .waitFreshResponse()
                                        .then(() => {
                                          const status =
                                            queryOsmoPixels.queryStatus
                                              .response;
                                          if (status) {
                                            setShowShareModal({
                                              numDots: status.data.numDots,
                                              numAccounts:
                                                status.data.numAccounts,
                                            });
                                          }
                                        });
                                    }
                                  })
                                  .catch((e) => {
                                    console.log(e);
                                  });
                              }, 1000);
                            },
                          }
                        );
                      } catch (e) {
                        console.log(e);
                      }
                    }}
                    doneEnabled={pixelIndex[0] >= 0 && pixelIndex[1] >= 0}
                  />
                ) : null}
              </React.Fragment>
            );
          }}
        </TransformWrapper>
      </div>
    </main>
  );
});

export default Pixels;
