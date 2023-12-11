import { FunctionComponent, useState } from "react";

import { CheckBox } from "~/components/control";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";

import { Button } from "../components/buttons";

export const ExternalLinkModal: FunctionComponent<
  { url: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = ({ url, ...modalBaseProps }) => {
  const { t } = useTranslation();
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const handleDoNotShowAgainChange = () => {
    setDoNotShowAgain(!doNotShowAgain);
    localStorage.setItem("doNotShowExternalLinkModal", String(!doNotShowAgain));
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
              className="block max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap text-wosmongton-300 hover:text-wosmongton-500"
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
          <CheckBox
            isOn={doNotShowAgain}
            onToggle={handleDoNotShowAgainChange}
          />
          <span className="text-md">{t("app.banner.doNotShowAgain")}</span>
        </label>

        <div className="flex w-full justify-between gap-4">
          <Button
            mode="secondary"
            className="flex-1"
            onClick={modalBaseProps.onRequestClose}
          >
            {t("app.banner.backToOsmosis")}
          </Button>
          <Button
            mode="primary"
            className="flex-1"
            onClick={modalBaseProps.onRequestClose}
          >
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
