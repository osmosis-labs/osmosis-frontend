import { FunctionComponent } from "react";

import { AssetsInfoTable } from "../table/asset-info";

export const AssetsPageV2: FunctionComponent = () => {
  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <AssetsInfoTable tableTopPadding={0} />
    </main>
  );
};
