import { useState } from "react";

import { Switch } from "~/components/control";

export const LockingDurationSwitch = () => {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="flex items-center gap-7">
      <span className="text-base font-subtitle1 font-bold">
        No Locking Duration
      </span>
      <Switch isOn={isOn} onToggle={setIsOn} />
    </div>
  );
};
