import { AllOfAuthenticator } from "@osmosis-labs/types";
import { isNil, parseAuthenticator } from "@osmosis-labs/utils";

import { queryAuthenticators } from "~/server/queries/osmosis/authenticators";
import { isNumeric } from "~/utils/assertion";

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
  authenticatorId: authenticatorIdParam,
  getAuthenticatorsFn = getAuthenticators,
}: {
  userOsmoAddress: string;
  publicKey?: string;
  authenticatorId?: string;

  /** Allow overriding getAuthenticators for tests */
  getAuthenticatorsFn?: typeof getAuthenticators;
}) {
  if (
    (isNil(authenticatorIdParam) || !isNumeric(authenticatorIdParam)) &&
    isNil(publicKey)
  ) {
    console.info("Session not found: authenticatorId and publicKey are empty");
    return;
  }

  const authenticators = await getAuthenticatorsFn({
    userOsmoAddress: userOsmoAddress,
  });

  if (!isNil(authenticatorIdParam) && isNumeric(authenticatorIdParam)) {
    return authenticators.find(
      (authenticator) => authenticator.id === authenticatorIdParam
    );
  }

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
