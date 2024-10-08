import Image from "next/image";
import React, { FunctionComponent, useState } from "react";
import {
  Id,
  toast,
  ToastContent,
  ToastOptions as ReactToastifyOptions,
} from "react-toastify";
import { useLocalStorage } from "react-use";

import { Alert, ToastType } from "~/components/alert";
import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { Checkbox } from "~/components/ui/checkbox";
import { t } from "~/hooks";

export type ToastOptions = Partial<ReactToastifyOptions> & {
  updateToastId?: Id;
};

export function displayToast(
  alert: Alert,
  type: ToastType,
  toastOptions?: ToastOptions
) {
  toastOptions = {
    position: "top-right",
    autoClose: type === ToastType.LOADING ? 2000 : 7000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    pauseOnFocusLoss: false,
    className: "group",
    closeButton: ({ closeToast }) => (
      <button
        onClick={closeToast}
        className="invisible absolute -left-2 -top-2 h-6 w-6 opacity-0 transition duration-200 hover:opacity-75 group-hover:visible group-hover:opacity-100 md:top-2 md:h-5 md:w-5"
      >
        <Image
          alt="close"
          src="/icons/close-circle.svg"
          height={32}
          width={32}
        />
      </button>
    ),
    ...(toastOptions ?? {}),
  };

  const showToast = toastOptions.updateToastId
    ? (content: ToastContent<unknown>, opts: ToastOptions) =>
        toast.update(toastOptions.updateToastId!, {
          render: content,
          ...opts,
        })
    : toast;
  switch (type) {
    case ToastType.SUCCESS:
      showToast(<SuccessToast {...alert} />, toastOptions);
      break;
    case ToastType.ERROR:
      showToast(<ErrorToast {...alert} />, toastOptions);
      break;
    case ToastType.LOADING:
      showToast(<LoadingToast {...alert} />, toastOptions);
      break;
    case ToastType.ONE_CLICK_TRADING:
      showToast(<OneClickTradingToast {...alert} />, toastOptions);
      break;
    case ToastType.ALLOYED_ASSETS:
      showToast(
        ({ closeToast }) => (
          <AlloyedAssetsToast {...alert} closeToast={closeToast} />
        ),
        {
          ...toastOptions,
          toastId: ToastType.ALLOYED_ASSETS, // prevents duplicate toasts by using an explicit toast id
          autoClose: false, // prevents Alloyed Assets toast from closing automatically - https://fkhadra.github.io/react-toastify/autoClose/
          closeButton: false,
        }
      );
      break;
  }
}

const LoadingToast: FunctionComponent<Alert> = ({
  titleTranslationKey,
  captionTranslationKey,
  captionElement,
  learnMoreUrl,
  learnMoreUrlCaption,
  iconElement,
}) => (
  <div className="flex items-center gap-3 md:gap-2">
    {iconElement ?? (
      <div className="flex h-8 w-8 shrink-0 animate-spin items-center">
        <Image
          alt="loading"
          src="/icons/loading-blue.svg"
          height={32}
          width={32}
        />
      </div>
    )}
    <div className="text-white-high">
      <h6 className="mb-2 text-lg md:text-base">{t(titleTranslationKey)}</h6>
      {captionElement}
      {captionTranslationKey && (
        <p className="text-sm md:text-xs">
          {typeof captionTranslationKey === "string"
            ? t(captionTranslationKey)
            : t(...captionTranslationKey)}
        </p>
      )}
      {learnMoreUrl && learnMoreUrlCaption && (
        <a
          target="__blank"
          href={learnMoreUrl}
          className="inline cursor-pointer text-sm hover:opacity-75 md:text-xs"
        >
          {t(learnMoreUrlCaption ?? "Learn more")}
          <div className="mb-0.75 ml-2 inline-block">
            <Icon aria-label="link" id="external-link" height={12} width={12} />
          </div>
        </a>
      )}
    </div>
  </div>
);

const ErrorToast: FunctionComponent<Alert> = ({
  titleTranslationKey,
  captionTranslationKey,
  captionElement,
}) => (
  <div className="flex items-center gap-3 md:gap-2">
    <div className="h-8 w-8 shrink-0">
      <Image alt="failed" src="/icons/error-x.svg" height={32} width={32} />
    </div>
    <div className="text-white-high">
      <h6 className="mb-2 text-lg md:text-base">{t(titleTranslationKey)}</h6>
      {captionElement}
      {captionTranslationKey && (
        <p className="text-sm md:text-xs">
          {typeof captionTranslationKey === "string"
            ? t(captionTranslationKey)
            : t(...captionTranslationKey)}
        </p>
      )}
    </div>
  </div>
);

const SuccessToast: FunctionComponent<Alert> = ({
  titleTranslationKey,
  learnMoreUrl,
  learnMoreUrlCaption,
  captionTranslationKey,
  captionElement,
}) => (
  <div className="flex items-center gap-3 md:gap-2">
    <div className="h-8 w-8 shrink-0">
      <Image alt="b" src="/icons/check-circle.svg" height={32} width={32} />
    </div>
    <div className="text-white-high">
      <h6 className="mb-2 text-lg md:text-base">{t(titleTranslationKey)}</h6>
      {captionElement}
      {captionTranslationKey && (
        <p className="text-sm md:text-xs">
          {typeof captionTranslationKey === "string"
            ? t(captionTranslationKey)
            : t(...captionTranslationKey)}
        </p>
      )}
      {learnMoreUrl && learnMoreUrlCaption && (
        <a
          target="__blank"
          href={learnMoreUrl}
          className="inline cursor-pointer text-sm hover:opacity-75 md:text-xs"
        >
          {t(learnMoreUrlCaption ?? "Learn more")}
          <div className="mb-0.75 ml-2 inline-block">
            <Icon aria-label="link" id="external-link" height={12} width={12} />
          </div>
        </a>
      )}
    </div>
  </div>
);

const OneClickTradingToast: FunctionComponent<Alert> = ({
  titleTranslationKey,
  captionTranslationKey,
  captionElement,
}) => (
  <div className="flex items-center gap-3 md:gap-2">
    <div className="h-8 w-8 shrink-0">
      <Image
        alt="1-Click Trading Small Icon"
        src="/images/1ct-small-icon.svg"
        height={32}
        width={32}
      />
    </div>
    <div className="text-white-high">
      <h6 className="mb-2 text-lg md:text-base">{t(titleTranslationKey)}</h6>
      {captionElement}
      {captionTranslationKey && (
        <p className="text-sm text-osmoverse-300 md:text-xs">
          {typeof captionTranslationKey === "string"
            ? t(captionTranslationKey)
            : t(...captionTranslationKey)}
        </p>
      )}
    </div>
  </div>
);

export const AlloyedAssetsToastDoNotShowKey =
  "do-not-show-alloyed-assets-toast";

export const AlloyedAssetsToast: FunctionComponent<
  Alert & { closeToast: () => void }
> = ({ titleTranslationKey, captionTranslationKey, closeToast }) => {
  const [, setDoNotShowAgain] = useLocalStorage(
    AlloyedAssetsToastDoNotShowKey,
    false
  );

  const [isRemindMeLaterChecked, setIsRemindMeLaterChecked] = useState(false);

  const onDismiss = () => {
    if (isRemindMeLaterChecked) {
      setDoNotShowAgain(false);
    } else {
      setDoNotShowAgain(true);
    }

    closeToast();
  };

  const onConvert = () => {
    // TODO: link to modal in other PR
    // open modal
    // Convert All
    //   remind me later ✅
    //     in modal, convert all invokes setDoNotShowAgain(true)
    //   remind me later ❌
    //     in modal, convert all invokes setDoNotShowAgain(true)
    // Convert Selected
    //   remind me later ✅
    //     in modal, convert all invokes setDoNotShowAgain(true)
    //   remind me later ❌ (still has remaining alloyed assets)
    //     in modal, convert all invokes setDoNotShowAgain(false)

    closeToast();
  };

  return (
    <div className="w-full flex-col items-center pt-3 pl-0.5 pb-1">
      <div className="flex w-full items-center justify-between">
        <div className="flex -space-x-2">
          <Icon
            id="usdc-variant-static"
            height={32}
            width={32}
            className="z-10"
          />
          <Icon
            id="btc-variant-static"
            height={32}
            width={32}
            className="z-20"
          />
          <Icon
            id="eth-variant-static"
            height={32}
            width={32}
            className="z-30"
          />
        </div>
        <Icon
          id="arrow"
          height={32}
          width={32}
          className="text-osmoverse-300"
        />
        <div className="flex -space-x-2">
          <Icon id="usdc-static" height={32} width={32} className="z-10" />
          <Icon id="btc-static" height={32} width={32} className="z-20" />
          <Icon id="eth-static" height={32} width={32} className="z-30" />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <h6 className="text-h6 text-white-full">{t(titleTranslationKey)}</h6>
        {captionTranslationKey && (
          <p className="text-body2 text-osmoverse-300">
            {typeof captionTranslationKey === "string"
              ? t(captionTranslationKey)
              : t(...captionTranslationKey)}
          </p>
        )}
        <label className="my-1 flex items-center gap-2">
          <Checkbox
            checked={isRemindMeLaterChecked}
            onCheckedChange={() =>
              setIsRemindMeLaterChecked(!isRemindMeLaterChecked)
            }
          />
          <span className="text-body2 text-osmoverse-300">
            {t("alloyedAssets.remindMeLater")}
          </span>
        </label>
        <div>
          <div className="flex justify-between gap-3">
            <Button
              mode="secondary"
              onClick={onDismiss}
              className="!border !border-osmoverse-alpha-700 !text-wosmongton-200"
            >
              {t("alloyedAssets.dismiss")}
            </Button>
            <Button className="text-white-full" onClick={onConvert}>
              {t("alloyedAssets.convert")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
