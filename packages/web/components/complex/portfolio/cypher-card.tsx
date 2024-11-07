import Link from "next/link";
import { useLocalStorage } from "react-use";

import { Icon } from "~/components/assets";
import { useTranslation } from "~/hooks";

export const CYPHER_CARD_URL = "https://pay.osmosis.zone?ref=osmosis";

export const CypherCard = () => {
  const { t } = useTranslation();
  const [isClosed, setIsClosed] = useLocalStorage("cypher-card-closed", false);

  if (isClosed) return null;

  return (
    <Link
      href={CYPHER_CARD_URL}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
    >
      <div className="relative flex h-[4.5rem] w-full flex-1 items-center gap-2 rounded-2xl bg-osmoverse-850 px-4 py-3">
        <div className="mr-3 flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-osmoverse-800">
          <Icon id="cypher-card" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="subtitle1 text-white-full">
            {t("cypherCard.cypherSpend")}
          </p>
          <p className="body2 text-osmoverse-300">
            {t("cypherCard.cypherOrder")}
          </p>
        </div>

        <div className="caption rounded-xl bg-osmoverse-800 p-1 px-2 text-osmoverse-300">
          {t("cypherCard.cypherBeta")}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            setIsClosed(true);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-osmoverse-300 hover:text-white-full"
        >
          <Icon id="close" width={16} height={16} />
        </button>
      </div>
    </Link>
  );
};
