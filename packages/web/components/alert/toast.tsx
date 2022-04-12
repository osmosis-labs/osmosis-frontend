import Image from "next/image";
import { FunctionComponent } from "react";
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
          className="hover:opacity-75 absolute top-2 md:-top-2 right-2 md:-left-2 h-5 md:h-6 w-5 md:w-6"
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

const LoadingToast: FunctionComponent<Alert> = ({ message, caption }) => (
  <div className="flex gap-3 md:gap-3.75">
    <div className="flex items-center animate-spin h-[32px] w-[32px]">
      <Image
        alt="loading"
        src="/icons/loading-blue.svg"
        height={32}
        width={32}
      />
    </div>
    <section className="text-white-high">
      <h6 className="mb-2 text-base md:text-lg">{message}</h6>
      {caption && <p className="text-xs md:text-sm">{caption}</p>}
    </section>
  </div>
);

const ErrorToast: FunctionComponent<Alert> = ({ message, caption }) => (
  <div className="flex gap-3 md:gap-3.75">
    <div className="w-8 h-8">
      <Image alt="failed" src="/icons/error-x.svg" height={32} width={32} />
    </div>
    <section className="text-white-high">
      <h6 className="mb-2 text-base md:text-lg">{message}</h6>
      {caption && <p className="text-xs md:text-sm">{caption}</p>}
    </section>
  </div>
);

const SuccessToast: FunctionComponent<Alert> = ({
  message,
  learnMoreUrl,
  learnMoreUrlCaption,
}) => (
  <div className="flex gap-3 md:gap-3.75">
    <div className="w-8 h-8">
      <Image alt="b" src="/icons/check-circle.svg" height={32} width={32} />
    </div>
    <section className="text-white-high">
      <h6 className="mb-2 text-base md:text-lg">{message}</h6>
      {learnMoreUrl && (
        <a
          target="__blank"
          href={learnMoreUrl}
          className="text-xs md:text-sm inline hover:opacity-75 cursor-pointer"
        >
          {learnMoreUrlCaption ?? "Learn more"}
          <div className="inline-block ml-2 mb-0.75">
            <Image
              alt="link"
              src="/icons/link-deco.svg"
              height={12}
              width={12}
            />
          </div>
        </a>
      )}
    </section>
  </div>
);
