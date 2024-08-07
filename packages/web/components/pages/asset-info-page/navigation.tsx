import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { ClientOnly } from "~/components/client-only";
import { Button } from "~/components/ui/button";
import { useTranslation, useUserWatchlist } from "~/hooks";
import { useAssetInfo } from "~/hooks/use-asset-info";

export const AssetNavigation: FunctionComponent = observer(() => {
  const { t } = useTranslation();
  const { watchListDenoms, toggleWatchAssetDenom } = useUserWatchlist();

  const { asset: token, title } = useAssetInfo();

  return (
    <nav className="flex w-full flex-wrap justify-between gap-2">
      <div className="flex flex-wrap items-center gap-4">
        {token.coinImageUrl ? (
          <Image
            src={token.coinImageUrl}
            alt={token.coinName}
            width={40}
            height={40}
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          {title ? <h6 className="font-h6">{title}</h6> : null}
          <h6 className="font-h6 text-osmoverse-300">{token.coinDenom}</h6>
        </div>
      </div>

      <div className="ml-auto flex items-center justify-center gap-2">
        <Button
          size="xsm"
          variant="secondary-outline"
          aria-label="Add to watchlist"
          onClick={() => toggleWatchAssetDenom(token.coinDenom)}
        >
          <ClientOnly>
            <Icon
              id="star-outlined"
              className={`mr-2 h-4 w-4 fill-transparent text-osmoverse-600 transition-all ${
                watchListDenoms.includes(token.coinDenom)
                  ? "fill-osmoverse-600"
                  : ""
              } `}
            />
          </ClientOnly>
          {t("tokenInfos.watchlist")}
        </Button>
      </div>
    </nav>
  );
});
