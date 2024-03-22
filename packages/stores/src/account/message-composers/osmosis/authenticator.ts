import { osmosis } from "@osmosis-labs/proto-codecs";

export function makeAddAuthenticatorMsg({
  type,
  data,
  sender,
}: {
  type: string;
  data: Uint8Array;
  sender: string;
}) {
  return osmosis.authenticator.MessageComposer.withTypeUrl.addAuthenticator({
    data,
    sender,
    type,
  });
}

export function makeRemoveAuthenticatorMsg({
  id,
  sender,
}: {
  id: bigint;
  sender: string;
}) {
  return osmosis.authenticator.MessageComposer.withTypeUrl.removeAuthenticator({
    id,
    sender,
  });
}
