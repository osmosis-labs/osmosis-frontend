import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";

export const HistoryEmpty: FunctionComponent = () => {
  return (
    <div className="mt-[4rem] flex flex-col items-center gap-3">
      <Icon className="mb-4 mt-2" id="sleep-bell" width={132} height={132} />
      <p className="w-[16rem] text-center font-body2 text-osmoverse-300">
        Nothing new. Check back soon.
      </p>
    </div>
  );
};
