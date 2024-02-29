import { parseAuthenticator } from "@osmosis-labs/utils";

import { queryAuthenticators } from "~/server/queries/osmosis/authenticators";

export async function getAuthenticators({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}) {
  const { account_authenticators: authenticators } = await queryAuthenticators({
    address: userOsmoAddress,
  });

  return authenticators.map((authenticator) =>
    parseAuthenticator({ authenticator })
  );
}
