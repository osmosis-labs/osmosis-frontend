import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";

export const HistoryEmpty: FunctionComponent = () => {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon className="mb-4 mt-2" id="bell" width={64} height={64} />
      <p className="text-subtitle1 font-subtitle1">No notifications yet</p>
    </div>
  );
};
