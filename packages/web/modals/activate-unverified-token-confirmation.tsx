import Image from "next/image";
import { FunctionComponent } from "react";

import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";

export const ActivateUnverifiedTokenConfirmation: FunctionComponent<
  {
    coinDenom?: string;
    coinImageUrl?: string;
    onConfirm: () => void;
  } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = ({ coinDenom, coinImageUrl, onConfirm, ...modalBaseProps }) => {
  const { t } = useTranslation();
  if (!coinDenom || !coinImageUrl) {
    return null;
  }

  return (
    <ModalBase
      title={t("assets.activateUnverifiedAssetsModal.activate")}
      className="!max-w-[480px]"
      {...modalBaseProps}
    >
      <div className="mx-auto flex max-w-sm flex-col items-center gap-8 pt-8">
        <div className="flex flex-col items-center gap-5">
          {coinImageUrl && (
            <div className="mr-4 h-16 w-16 rounded-full">
              <Image
                src={coinImageUrl}
                alt="token icon"
                width={64}
                height={64}
              />
            </div>
          )}

          <div>
            <p className="body2 rounded-2xl text-osmoverse-100">
              <span className="font-semibold">{coinDenom}</span>{" "}
              {t("assets.activateUnverifiedAssetsModal.description")}
            </p>

            <p className="body2 border-gradient-neutral mt-5 rounded-lg border border-wosmongton-400 px-3 py-2 text-wosmongton-100">
              {t("assets.activateUnverifiedAssetsModal.reminder")}
            </p>
          </div>
        </div>
        <div className="max-w-md">
          <Button
            onClick={() => {
              onConfirm();
              modalBaseProps.onRequestClose?.();
            }}
          >
            {t("assets.table.activate")}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};
