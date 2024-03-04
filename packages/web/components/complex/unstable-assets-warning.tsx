import { FunctionComponent } from "react";

import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

interface UnstableAssetWarningProps {
  onContinue: () => void;
  onCancel: () => void;
}

export const UnstableAssetWarning: FunctionComponent<
  UnstableAssetWarningProps
> = ({ onCancel, onContinue }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full flex-col">
      <p className="my-8 text-center text-base text-osmoverse-200">
        {t("unstableAssetsWarning.description")}
      </p>
      <div className="flex w-full flex-col gap-2">
        <Button variant="destructive" onClick={onContinue}>
          {t("unstableAssetsWarning.buttonContinue")}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {t("unstableAssetsWarning.buttonCancel")}
        </Button>
      </div>
    </div>
  );
};
