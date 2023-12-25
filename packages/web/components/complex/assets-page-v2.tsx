import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { AssetsInfoTable } from "../table/asset-info";

export const AssetsPageV2: FunctionComponent = observer(() => {
  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <AssetsInfoTable
        onDeposit={(coinDenom) => {
          console.log("deposit", coinDenom);
        }}
        onWithdraw={(coinDenom) => {
          console.log("withdraw", coinDenom);
        }}
      />
    </main>
  );
});
