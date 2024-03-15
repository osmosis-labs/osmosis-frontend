import { FunctionComponent } from "react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";

const DoNotShowAgainExcludedUrlsKey = "do-not-show-again-excluded-urls";
type DoNotShowAgainExcludedUrls = Record<string, boolean>;

export function getDoNotShowAgainExcludedUrls(): DoNotShowAgainExcludedUrls {
  const value = localStorage.getItem(DoNotShowAgainExcludedUrlsKey);
  return value ? JSON.parse(value) : {};
}

function setDoNotShowAgainExcludedUrls(url: string, value: boolean) {
  const excludedUrls = getDoNotShowAgainExcludedUrls();
  excludedUrls[url] = value;
  return localStorage.setItem(
    DoNotShowAgainExcludedUrlsKey,
    JSON.stringify(excludedUrls)
  );
}

export function handleExternalLink({
  url,
  openModal,
}: {
  url: string;
  openModal: () => void;
}) {
  try {
    const doNotShowModalExcludedUrls = getDoNotShowAgainExcludedUrls();

    if (doNotShowModalExcludedUrls[url]) {
      window.open(url, "_blank");
    } else {
      openModal();
    }
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    openModal();
  }
}

export const ExternalLinkModal: FunctionComponent<
  { url: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = ({ url, ...modalBaseProps }) => {
  const { t } = useTranslation();
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const onToggleDoNotShowAgain = () => {
    setDoNotShowAgain((prevDoNotShowAgain) => {
      const nextValue = !prevDoNotShowAgain;
      setDoNotShowAgainExcludedUrls(url, nextValue);
      return nextValue;
    });
  };

  return (
    <ModalBase
      title={t("app.banner.externalLinkModalTitle")}
      className="text-white max-w-[460px] !bg-osmoverse-850"
      {...modalBaseProps}
    >
      <div className="flex flex-col items-center pt-4">
        <div className="mb-8 rounded-2xl bg-osmoverse-825 pl-5 pr-5 pt-5 text-left">
          <p className="body2 text-osmoverse-100">
            {t("app.banner.externalLink")}{" "}
            <a
              href={url}
              className="block break-all text-wosmongton-300 hover:text-wosmongton-500"
              target="_blank"
              rel="noopener noreferrer"
              title={url}
            >
              {url}
            </a>
          </p>

          <p className="body2 mt-4 mb-6 text-osmoverse-300">
            {t("app.banner.externalLinkDisclaimer")}
          </p>
        </div>

        <label className="mb-6 flex items-center space-x-2">
          <Checkbox checked={doNotShowAgain} onClick={onToggleDoNotShowAgain} />
          <span className="text-md">{t("app.banner.doNotShowAgain")}</span>
        </label>

        <div className="flex w-full justify-between gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={modalBaseProps.onRequestClose}
          >
            {t("app.banner.backToOsmosis")}
          </Button>
          <Button className="flex-1" onClick={modalBaseProps.onRequestClose}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white"
            >
              {t("app.banner.goToSite")}
            </a>
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};
