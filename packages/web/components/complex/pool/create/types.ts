import { ObservableCreatePoolConfig } from "@osmosis-labs/stores";

import { CustomClasses } from "~/components/types";

export interface StepProps extends CustomClasses {
  createPoolConfig: ObservableCreatePoolConfig;
  isSendingMsg?: boolean;
  advanceStep: () => void;
}
