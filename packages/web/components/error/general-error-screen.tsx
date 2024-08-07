import Image from "next/image";
import { FunctionComponent } from "react";
import { FallbackProps } from "react-error-boundary";

import { Icon } from "~/components/assets";
import { Button, IconButton } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

export const GeneralErrorScreen: FunctionComponent<
  FallbackProps & { onClose: () => void }
> = ({ resetErrorBoundary, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="text-white relative mx-auto flex h-full w-full max-w-7xl items-center justify-center bg-osmoverse-900">
      <IconButton
        aria-label="Close"
        className="absolute top-4 right-4 z-50 !h-12 !w-12 flex-shrink-0 text-wosmongton-200 hover:text-osmoverse-100 md:!h-8 md:!w-8"
        variant="secondary"
        icon={<Icon id="close" className="md:h-4 md:w-4" />}
        onClick={onClose}
      />
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/images/leaking-beaker.svg"
          alt="Leaking beaker"
          width={224}
          height={168}
        />
        <h1 className="text-2xl font-bold leading-9">
          {t("errors.uhOhSomethingWentWrong")}
        </h1>
        <p className="text-center">{t("errors.sorryForTheInconvenience")}</p>
        <Button variant="secondary" onClick={resetErrorBoundary}>
          {t("errors.startAgain")}
        </Button>
      </div>
    </div>
  );
};
