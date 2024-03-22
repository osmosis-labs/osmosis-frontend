import { AllOfAuthenticator, Chain } from "@osmosis-labs/types";
import { isNil, isNumeric, parseAuthenticator } from "@osmosis-labs/utils";

import { queryAuthenticators } from "../osmosis/authenticators";

export async function getAuthenticators({
  userOsmoAddress,
  chainList,
}: {
  userOsmoAddress: string;
  chainList: Chain[];
}) {
  const { account_authenticators: authenticators } = await queryAuthenticators({
    address: userOsmoAddress,
    chainList,
  });

  return authenticators.map((authenticator) =>
    parseAuthenticator({ authenticator })
  );
}

export async function getSessionAuthenticator({
  userOsmoAddress,
  publicKey,
  chainList,
  authenticatorId: authenticatorIdParam,
  getAuthenticatorsFn = getAuthenticators,
}: {
  userOsmoAddress: string;
  chainList: Chain[];
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
    chainList,
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
