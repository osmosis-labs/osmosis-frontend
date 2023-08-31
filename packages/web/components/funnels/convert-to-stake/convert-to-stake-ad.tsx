import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { CustomClasses } from "~/components/types";
import { useWindowSize } from "~/hooks";
import { useStore } from "~/stores";

export const ConvertToStakeAd: FunctionComponent<
  {
    onClickCta: () => void;
  } & CustomClasses
> = observer(({ onClickCta, className }) => {
  const {
    queriesStore,
    chainStore: {
      osmosis: { chainId },
    },
  } = useStore();
  const { isMobile } = useWindowSize();

  const inflationApr =
    queriesStore.get(chainId).cosmos.queryInflation.inflation;

  const t = useTranslation();

  if (isMobile) return null;

  return (
    <div
      className={classNames(
        "relative h-fit w-full place-content-between overflow-clip rounded-3xl bg-osmoverse-800 marker:flex",
        className
      )}
    >
      <div className="flex w-2/3 shrink flex-col gap-4 px-9 py-8">
        <h6>{t("convertToStake.adTitle")}</h6>
        <p className="body2 rounded-3xl bg-osmoverse-800/80 text-osmoverse-100">
          {t("convertToStake.adSubtitle", {
            apr: inflationApr.maxDecimals(1).toString(),
          })}
        </p>
        <Button className="w-fit" mode="special-1" onClick={onClickCta}>
          {t("convertToStake.convertAndStake")}
        </Button>
      </div>

      <div className="absolute right-2 -top-20 lg:hidden">
        <Image
          alt="osmo tokens"
          src="/images/osmo-tokens.svg"
          width={400}
          height={400}
        />
      </div>
    </div>
  );
});
