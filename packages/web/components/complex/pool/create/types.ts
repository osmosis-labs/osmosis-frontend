import { CustomClasses } from "~/components/types";
import type { CreatePoolConfig } from "~/hooks/ui-config/use-create-pool-config";

export interface StepProps extends CustomClasses {
  createPoolConfig: CreatePoolConfig;
  isSendingMsg?: boolean;
  advanceStep: () => void;
}
