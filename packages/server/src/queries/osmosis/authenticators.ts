import { RawAuthenticator } from "@osmosis-labs/types";

import { createNodeQuery } from "../base-utils";

export const queryAuthenticators = createNodeQuery<
  {
    account_authenticators: RawAuthenticator[];
  },
  { address: string }
>({
  path: ({ address }) => `osmosis/authenticator/authenticators/${address}`,
});
