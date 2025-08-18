import type { Wallet } from "@cosmos-kit/core";

import { ICON } from "./constant";

export interface EWalletInfo extends Wallet {
  apiKey: string;
}

export const ewalletInfo: EWalletInfo = {
  name: "ewallet",
  prettyName: "eWallet",
  logo: ICON,
  mode: "extension",
  mobileDisabled: false,
  rejectMessage: {
    source: "Request rejected",
  },
  connectEventNamesOnWindow: ["ewallet_keystorechange"],
  apiKey: "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
};
