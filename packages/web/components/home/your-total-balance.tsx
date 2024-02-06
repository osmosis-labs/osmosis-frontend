import Link from "next/link";
import React from "react";

import { Icon } from "~/components/assets";
import { useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const YourTotalBalance = () => {
  const { accountStore, chainStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isWalletLoading } = useWalletSelect();

  const { data: value } = api.edge.assets.getUserAssetsBreakdown.useQuery(
    {
      userOsmoAddress: account?.address ?? "",
    },
    {
      enabled: !!account && !isWalletLoading,

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  return (
    <div className="flex flex-col gap-3 1.5lg:hidden">
      <span className="text-subtitle1 text-osmoverse-300">
        Your total balance
      </span>
      <h3>{value?.aggregatedValue.toString() ?? "N.D."}</h3>
      <span className="inline-flex items-center gap-3">
        {/* <span className="text-subititle1 text-bullish-500">
          ↗️ $1,863.96 &#40;5.6%&#41;
        </span> */}
        <Link
          href={"/assets"}
          className="text-subititle1 inline-flex items-center gap-1 text-wosmongton-200"
        >
          View assets
          <Icon id="arrow-right" color="#B3B1FD" className="h-4 w-4" />
        </Link>
      </span>
    </div>
  );
};
