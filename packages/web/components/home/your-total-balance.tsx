import Link from "next/link";
import React from "react";

import { Icon } from "~/components/assets";

export const YourTotalBalance = () => {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-subtitle1 text-osmoverse-300">
        Your total balance
      </span>
      <h3>$3,920,849.61</h3>
      <span className="inline-flex items-center gap-3">
        <span className="text-subititle1 text-bullish-500">
          ↗️ $1,863.96 &#40;5.6%&#41;
        </span>
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
