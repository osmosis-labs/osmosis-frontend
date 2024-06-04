import { ChainWalletBase, ExpiredError, State } from "@cosmos-kit/core";
import { Popover } from "@headlessui/react";
import classNames from "classnames";
import Image from "next/image";
import React, { Fragment, FunctionComponent, Suspense, useMemo } from "react";

import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

const QRCode = React.lazy(() =>
  import("~/components/qrcode").then((module) => ({ default: module.QRCode }))
);

const QRCodeLoader = () => (
  <div className="mb-7">
    <SkeletonLoader>
      <div className="flex items-center justify-center rounded-xl p-3.5">
        <div className="h-[280px] w-[280px]" />
      </div>
    </SkeletonLoader>
  </div>
);

type QRCodeStatus = "pending" | "done" | "error" | "expired" | undefined;

export const QRCodeView: FunctionComponent<{ wallet?: ChainWalletBase }> = ({
  wallet,
}) => {
  const { t } = useTranslation();

  const qrUrl = wallet?.qrUrl;

  const [errorTitle, errorDesc, status] = useMemo(() => {
    const isExpired = qrUrl?.message === ExpiredError.message;

    const errorDesc = isExpired
      ? t("walletSelect.clickToRefresh")
      : qrUrl?.message;
    const errorTitle = isExpired
      ? t("walletSelect.qrCodeExpired")
      : t("walletSelect.qrCodeError");

    const statusDict: Record<State, QRCodeStatus> = {
      [State.Pending]: "pending" as const,
      [State.Done]: "done" as const,
      [State.Error]: isExpired ? ("expired" as const) : ("error" as const),
      [State.Init]: undefined,
    };

    return [errorTitle, errorDesc, statusDict[qrUrl?.state ?? State.Init]];
  }, [qrUrl?.message, qrUrl?.state, t]);

  const downloadLink = wallet?.walletInfo.downloads?.find(
    ({ os }) => !os
  )?.link;

  return (
    <Popover as={Fragment}>
      {({ open: isDownloadQROpen }) => (
        <div
          className={classNames(
            "relative flex flex-col items-center justify-center gap-4",
            isDownloadQROpen &&
              "before:absolute before:inset-0 before:z-50 before:bg-osmoverse-800/70"
          )}
        >
          <h1 className="mb-6 w-full text-center text-h6 font-h6 tracking-wider">
            {t("walletSelect.connectWith")} {wallet?.walletPrettyName}
          </h1>

          <div className="mb-6 flex flex-col items-center justify-center gap-3">
            <p className="flex items-center gap-2 rounded-2xl bg-osmoverse-900 px-10 py-3 text-osmoverse-200">
              <span>{t("walletSelect.tapThe")}</span>
              <Image
                src="/icons/scan.png"
                alt="scan icon"
                width={28}
                height={28}
              />
              <span>{t("walletSelect.button")}</span>
            </p>

            <p className="body2 max-w-sm text-center text-wosmongton-100">
              {t("walletSelect.topRightButton", {
                wallet: wallet?.walletPrettyName ?? "",
              })}
            </p>
          </div>

          {(status === "error" || status === "expired") && (
            <>
              <div className="relative mb-7 flex items-center justify-center rounded-xl bg-white-high p-3.5">
                <div className="absolute inset-0 rounded-xl bg-white-high/80" />
                <QRCode value="https//" size={280} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    className="w-fit"
                    onClick={() => wallet?.connect(false)}
                  >
                    {t("walletSelect.refresh")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-center text-h6 font-h6">{errorTitle}</h1>
                <p className="body2 text-center text-wosmongton-100">
                  {errorDesc}
                </p>
              </div>
            </>
          )}
          {status === "pending" && <QRCodeLoader />}
          {status === "done" && (
            <div className="flex flex-col items-center gap-1">
              <div className="w-fit">
                {Boolean(qrUrl?.data) && (
                  <Suspense fallback={<QRCodeLoader />}>
                    <div
                      className={classNames(
                        "mb-2 flex items-center justify-center rounded-3xl bg-white-high p-3.5"
                      )}
                    >
                      <QRCode
                        logoSize={70}
                        logoUrl={
                          typeof wallet?.walletInfo.logo === "string"
                            ? wallet?.walletInfo.logo
                            : undefined
                        }
                        value={qrUrl?.data!}
                        size={280}
                      />
                    </div>
                  </Suspense>
                )}
              </div>

              <div className="flex items-center gap-2">
                <p className="body2 text-osmoverse-200">
                  {t("walletSelect.dontHaveThisWallet")}
                </p>

                <div className="relative">
                  <Popover.Button
                    className={classNames(
                      "button relative z-[60] flex h-6 w-auto items-center rounded-xl bg-wosmongton-500 px-2 hover:bg-wosmongton-300",
                      isDownloadQROpen && "bg-wosmongton-300"
                    )}
                  >
                    {t("walletSelect.get")} {wallet?.walletPrettyName}
                  </Popover.Button>

                  <Popover.Panel className="subtitle1 absolute bottom-8 right-0 z-[60] flex flex-col gap-3 rounded-3xl bg-osmoverse-800 px-10 py-6 text-center shadow-[0px_6px_8px_0px_#09052433]">
                    <p className="text-osmoverse-100">
                      {t("walletSelect.scanThis")} {wallet?.walletPrettyName}
                    </p>
                    {typeof downloadLink === "string" &&
                      downloadLink !== "" && (
                        <Suspense fallback={<QRCodeLoader />}>
                          <div
                            className={classNames(
                              "mb-2 flex items-center justify-center rounded-3xl bg-white-high p-3.5"
                            )}
                          >
                            <QRCode
                              logoSize={70}
                              logoUrl={
                                typeof wallet?.walletInfo.logo === "string"
                                  ? wallet?.walletInfo.logo
                                  : undefined
                              }
                              value={downloadLink}
                              size={280}
                            />
                          </div>
                        </Suspense>
                      )}
                  </Popover.Panel>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Popover>
  );
};
