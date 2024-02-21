import {
  Authenticator,
  queryAuthenticators,
} from "~/server/queries/osmosis/authenticators";

interface NestedAuthenticator {
  authenticator_type: Authenticator["type"];
  data: Authenticator["data"];
}

export async function getAuthenticators({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}) {
  const { authenticators } = await queryAuthenticators({
    address: userOsmoAddress,
  });

  return authenticators.map(({ data, id, type }) => {
    let subAuthenticators: NestedAuthenticator[] | undefined;

    if (type === "AllOfAuthenticator" || type === "AnyOfAuthenticator") {
      const parsedData = Buffer.from(data, "base64").toString("utf-8");
      subAuthenticators = JSON.parse(parsedData);
    }

    return {
      id,
      type,
      data,
      subAuthenticators,
    };
  });
}
