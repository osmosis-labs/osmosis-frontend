import Link from "next/link";

import { Icon } from "~/components/assets";

export const CypherCard = () => {
  return (
    <Link
      href="https://osmosis.cyphercard.io"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="min-h-16 flex w-full flex-1 items-center gap-4 rounded-2xl bg-osmoverse-850 py-3 px-4">
        <div className="mr-3 flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-osmoverse-800">
          <Icon id="cypher-card" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="subtitle1 text-white-full">Spend with OSMO</p>
          <p className="body2 text-osmoverse-300">Order your card now</p>
        </div>
        <div className="caption ml-auto rounded-xl bg-osmoverse-800 p-1 px-2 text-osmoverse-300">
          Beta
        </div>
      </div>
    </Link>
  );
};
