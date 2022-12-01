import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useStore } from "../stores";

const NavbarOsmoPrice = observer(() => {
  const { priceStore, chainStore, queriesExternalStore } = useStore();

  const osmoCurrency = chainStore.osmosis.stakeCurrency;
  const osmoPrice = priceStore.calculatePrice(
    new CoinPretty(
      chainStore.osmosis.stakeCurrency,
      DecUtils.getTenExponentNInPrecisionRange(
        chainStore.osmosis.stakeCurrency.coinDecimals
      )
    )
  );
  const query = queriesExternalStore.queryTokenHistoricalChart.get(
    chainStore.osmosis.stakeCurrency.coinDenom
  );

  if (!osmoPrice || !osmoCurrency) return null;

  return (
    <div className="px-2">
      <div className="flex items-center gap-1">
        <div className="h-[20px] w-[20px]">
          <Image
            src={osmoCurrency.coinImageUrl!}
            alt="Osmo icon"
            width={20}
            height={20}
          />
        </div>

        <p>{osmoPrice.maxDecimals(2).toString()}</p>
      </div>
    </div>
  );
});

export default NavbarOsmoPrice;
