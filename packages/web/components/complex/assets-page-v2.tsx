import { FunctionComponent } from "react";

import { AssetsInfoTable } from "../table/asset-info";

export const AssetsPageV2: FunctionComponent = () => {
  return (
    <main className="mx-auto max-w-container p-8 pt-4 md:p-4">
      <AssetsInfoTable tableTopPadding={16} />
    </main>
  );
};
