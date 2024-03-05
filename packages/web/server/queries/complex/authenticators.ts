import { AllOfAuthenticator } from "@osmosis-labs/types";
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

export async function getSessionAuthenticator({
  userOsmoAddress,
  publicKey,
}: {
  userOsmoAddress: string;
  publicKey: string;
}) {
  const authenticators = await getAuthenticators({
    userOsmoAddress: userOsmoAddress,
  });

  const subAuthenticators = authenticators
    .filter(
      (authenticator): authenticator is AllOfAuthenticator =>
        authenticator.type === "AllOfAuthenticator"
    )
    .flatMap((authenticator) =>
      authenticator.subAuthenticators.map((sub) => ({
        ...sub,
        authenticatorId: authenticator.id,
      }))
    );

  if (subAuthenticators.length === 0) {
    console.info("Session not found: authenticators array is empty");
    return;
  }

  const authenticatorId = subAuthenticators.find(
    (authenticator) =>
      authenticator.type === "SignatureVerificationAuthenticator" &&
      authenticator.publicKey === publicKey
  )?.authenticatorId;

  return authenticators.find(
    (authenticator) => authenticator.id === authenticatorId
  );
}
