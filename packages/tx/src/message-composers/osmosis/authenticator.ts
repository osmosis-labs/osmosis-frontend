import { getOsmosisCodec } from "../../codec";

export async function makeAddAuthenticatorMsg({
  authenticatorType,
  data,
  sender,
}: {
  authenticatorType: string;
  data: Uint8Array;
  sender: string;
}) {
  const osmosis = await getOsmosisCodec();
  return osmosis.smartaccount.v1beta1.MessageComposer.withTypeUrl.addAuthenticator(
    {
      data,
      sender,
      authenticatorType,
    }
  );
}

export async function makeRemoveAuthenticatorMsg({
  id,
  sender,
}: {
  id: bigint;
  sender: string;
}) {
  const osmosis = await getOsmosisCodec();
  return osmosis.smartaccount.v1beta1.MessageComposer.withTypeUrl.removeAuthenticator(
    {
      id,
      sender,
    }
  );
}
