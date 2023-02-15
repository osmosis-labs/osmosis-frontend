import Image from "next/image";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";
import { toast, ToastOptions } from "react-toastify";

import { Alert, ToastType } from "./types";

export function displayToast(
  alert: Alert,
  type: ToastType,
  toastOptions?: Partial<ToastOptions>
) {
  toastOptions = {
    ...{
      position: "top-right",
      autoClose: 7000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
      pauseOnFocusLoss: false,
      closeButton: ({ closeToast }) => (
        <button
          onClick={closeToast}
          className="absolute -top-2 -left-2 h-6 w-6 hover:opacity-75 md:top-2 md:h-5 md:w-5"
        >
          <Image
            alt="close"
            src="/icons/close-circle.svg"
            height={32}
            width={32}
          />
        </button>
      ),
    },
    ...(toastOptions ?? {}),
  };

  switch (type) {
    case ToastType.SUCCESS:
      toast(<SuccessToast {...alert} />, toastOptions);
      break;
    case ToastType.ERROR:
      toast(<ErrorToast {...alert} />, toastOptions);
      break;
    case ToastType.LOADING:
      toast(<LoadingToast {...alert} />, toastOptions);
      break;
  }
}

const LoadingToast: FunctionComponent<Alert> = ({ message, caption }) => {
  const t = useTranslation();
  return (
    <div className="flex items-center gap-3 md:gap-2">
      <div className="flex h-8 w-8 shrink-0 animate-spin items-center">
        <Image
          alt="loading"
          src="/icons/loading-blue.svg"
          height={32}
          width={32}
        />
      </div>
      <div className="text-white-high">
        <h6 className="mb-2 text-lg md:text-base">{t(message)}</h6>
        {caption && <p className="text-sm md:text-xs">{t(caption)}</p>}
      </div>
    </div>
  );
};

const ErrorToast: FunctionComponent<Alert> = ({ message, caption }) => {
  const t = useTranslation();
  return (
    <div className="flex items-center gap-3 md:gap-2">
      <div className="h-8 w-8 shrink-0">
        <Image alt="failed" src="/icons/error-x.svg" height={32} width={32} />
      </div>
      <div className="text-white-high">
        <h6 className="mb-2 text-lg md:text-base">{t(message)}</h6>
        {caption && <p className="text-sm md:text-xs">{t(caption)}</p>}
      </div>
    </div>
  );
};

const SuccessToast: FunctionComponent<Alert> = ({
  message,
  learnMoreUrl,
  learnMoreUrlCaption,
}) => {
  const t = useTranslation();
  return (
    <div className="flex items-center gap-3 md:gap-2">
      <div className="h-8 w-8 shrink-0">
        <Image alt="b" src="/icons/check-circle.svg" height={32} width={32} />
      </div>
      <div className="text-white-high">
        <h6 className="mb-2 text-lg md:text-base">{t(message)}</h6>
        {learnMoreUrl && learnMoreUrlCaption && (
          <a
            target="__blank"
            href={learnMoreUrl}
            className="inline cursor-pointer text-sm hover:opacity-75 md:text-xs"
          >
            {t(learnMoreUrlCaption ?? "Learn more")}
            <div className="mb-0.75 ml-2 inline-block">
              <Image
                alt="link"
                src="/icons/link-deco.svg"
                height={12}
                width={12}
              />
            </div>
          </a>
        )}
      </div>
    </div>
  );
};
