import { osmosis } from "@osmosis-labs/proto-codecs";

export function makeAddAuthenticatorMsg({
  authenticatorType,
  data,
  sender,
}: {
  authenticatorType: string;
  data: Uint8Array;
  sender: string;
}) {
  return osmosis.smartaccount.v1beta1.MessageComposer.withTypeUrl.addAuthenticator(
    {
      data,
      sender,
      authenticatorType,
    }
  );
}

export function makeRemoveAuthenticatorMsg({
  id,
  sender,
}: {
  id: bigint;
  sender: string;
}) {
  return osmosis.smartaccount.v1beta1.MessageComposer.withTypeUrl.removeAuthenticator(
    {
      id,
      sender,
    }
  );
}
