import { FunctionComponent } from "react";

import { Button, buttonCVA } from "~/components/buttons";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";

export const ExternalLinkModal: FunctionComponent<
  { url: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = ({ url, ...modalBaseProps }) => {
  const { t } = useTranslation();
  return (
    <ModalBase
      title={t("app.banner.externalLinkModalTitle")}
      className="!max-w-[400px]"
      {...modalBaseProps}
    >
      <div className="flex flex-col items-center pt-9">
        <p className="body2 rounded-2xl bg-osmoverse-900 p-5">
          {t("app.banner.externalLink")}{" "}
          <span className="text-wosmongton-300">{url}</span>
        </p>

        <p className="body2 border-gradient-neutral mt-2 rounded-[10px] border border-wosmongton-400 px-3 py-2 text-wosmongton-100">
          {t("app.banner.externalLinkDisclaimer")}
        </p>

        <div className="mt-4 flex w-full gap-3">
          <Button
            mode="secondary"
            className="whitespace-nowrap !px-3.5"
            onClick={modalBaseProps.onRequestClose}
          >
            {t("app.banner.backToOsmosis")}
          </Button>
          <a
            className={buttonCVA({
              mode: "primary",
            })}
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            onClick={modalBaseProps.onRequestClose}
          >
            {t("app.banner.goToSite")}
          </a>
        </div>
      </div>
    </ModalBase>
  );
};
