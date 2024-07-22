import Image from "next/image";
import { FunctionComponent } from "react";
import { FallbackProps } from "react-error-boundary";

import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

export const GeneralErrorScreen: FunctionComponent<FallbackProps> = ({
  resetErrorBoundary,
}) => {
  const { t } = useTranslation();
  return (
    <div className="text-white flex h-full w-full items-center justify-center bg-osmoverse-900">
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
