import { ObservableCreatePoolConfig } from "@osmosis-labs/stores";

import { CustomClasses } from "../../../types";

export interface StepProps extends CustomClasses {
  createPoolConfig: ObservableCreatePoolConfig;
  isSendingMsg?: boolean;
  advanceStep: () => void;
  children?: React.ReactNode;
}
