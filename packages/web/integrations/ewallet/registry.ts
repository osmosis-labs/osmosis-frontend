import type { Wallet } from "@cosmos-kit/core";

import { ICON } from "./constant";

export const ewalletInfo: Wallet = {
  name: "ewallet",
  prettyName: "eWallet",
  logo: ICON,
  mode: "extension",
  mobileDisabled: false,
  rejectMessage: {
    source: "Request rejected",
  },
  connectEventNamesOnWindow: ["ewallet_keystorechange"],
};
