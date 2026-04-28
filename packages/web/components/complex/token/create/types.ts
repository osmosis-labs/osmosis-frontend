import { CustomClasses } from "~/components/types";

export interface CreateTokenConfig {
  // Step 1 — Identity
  subdenom: string;
  name: string;
  symbol: string;
  decimals: number;

  // Step 2 — Details
  description: string;
  uri: string;
  uriHash: string;

  // Step 3 — Supply & Admin
  mintEnabled: boolean;
  mintAmount: string;
  mintRecipient: string;
  changeAdminEnabled: boolean;
  newAdmin: string;

  // Step 4
  acknowledgeFee: boolean;
}

export interface CreateTokenStepProps extends CustomClasses {
  config: CreateTokenConfig;
  setConfig: (patch: Partial<CreateTokenConfig>) => void;
  walletAddress: string;
  isSendingMsg?: boolean;
  advanceStep: () => void;
  /** Override the canAdvance gate computed by StepBase (e.g. for renounce confirmation). */
  extraCanAdvance?: boolean;
}
