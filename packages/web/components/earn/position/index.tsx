import classNames from "classnames";

import { Spinner } from "~/components/loaders";
import { useTranslation } from "~/hooks";

export const EarnPosition = ({
  totalBalance,
  isLoading,
  numberOfPositions,
  setTabIdx,
}: {
  totalBalance: string;
  isLoading: boolean;
  numberOfPositions: number;
  setTabIdx: (v: number) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-3.5">
        <h5 className="text-lg font-semibold leading-normal text-osmoverse-100">
          {t("earnPage.positions")}
        </h5>
        <button
          disabled={numberOfPositions === 0}
          onClick={() => setTabIdx(1)}
          type="button"
        >
          <p className="whitespace-nowrap text-sm font-semibold text-wosmongton-300">
            {numberOfPositions === 1
              ? t("earnPage.oneStrategy")
              : t("earnPage.strategiesCount", {
                  number: numberOfPositions.toString(),
                })}
          </p>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-4">
          <p className="text-subtitle-1">{t("earnPage.totalValueInvested")}</p>
          {/* <Tooltip content="lorem ipsum">
            <Icon id="info" width={16} height={16} />
          </Tooltip> */}
          <Spinner
            className={classNames({ hidden: !isLoading, block: isLoading })}
          />
        </span>
        <h3 className="text-osmoverse-100">{totalBalance}</h3>
      </div>
    </div>
  );
};
