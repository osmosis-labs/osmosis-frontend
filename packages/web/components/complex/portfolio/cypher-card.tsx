import Link from "next/link";

import { Icon } from "~/components/assets";
import { useTranslation } from "~/hooks";

export const CypherCard = () => {
  const { t } = useTranslation();
  return (
    <Link
      href="https://osmosis.cyphercard.io"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex h-[4.5rem] w-full flex-1 items-center gap-4 rounded-2xl bg-osmoverse-850 px-4 py-3">
        <div className="mr-3 flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-osmoverse-800">
          <Icon id="cypher-card" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="subtitle1 text-white-full">
            {t("portfolio.cypherSpend")}
          </p>
          <p className="body2 text-osmoverse-300">
            {t("portfolio.cypherOrder")}
          </p>
        </div>
        <div className="caption ml-auto rounded-xl bg-osmoverse-800 p-1 px-2 text-osmoverse-300">
          {t("portfolio.cypherBeta")}
        </div>
      </div>
    </Link>
  );
};
