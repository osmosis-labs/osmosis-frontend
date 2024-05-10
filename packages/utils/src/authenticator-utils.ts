import {
  CosmwasmAuthenticatorV1,
  NestedAuthenticator,
  ParsedAuthenticator,
  RawAuthenticator,
  RawNestedAuthenticator,
} from "@osmosis-labs/types";

/**
 * We should probably move this method to the 'server' package once we create it.
 */
export function parseAuthenticator({
  authenticator: rawAuthenticator,
}: {
  authenticator: RawAuthenticator;
}): ParsedAuthenticator {
  try {
    if (rawAuthenticator.type === "SignatureVerification") {
      return {
        id: rawAuthenticator?.id,
        type: "SignatureVerification",
        publicKey: rawAuthenticator.data,
      };
    }

    if (rawAuthenticator.type === "CosmwasmAuthenticatorV1") {
      const parsedData: { contract: string; params: string } = JSON.parse(
        Buffer.from(rawAuthenticator.data, "base64").toString("utf-8")
      );
      const parsedParams = JSON.parse(
        Buffer.from(parsedData.params, "base64").toString("utf-8")
      );
      return {
        id: rawAuthenticator?.id,
        type: "CosmwasmAuthenticatorV1",
        contract: parsedData.contract,
        params: parsedParams,
      } as CosmwasmAuthenticatorV1;
    }

    if (rawAuthenticator.type === "MessageFilter") {
      const parsedData: { "@type": string } = JSON.parse(
        Buffer.from(rawAuthenticator.data, "base64").toString("utf-8")
      );
      return {
        id: rawAuthenticator?.id,
        type: "MessageFilter",
        "@type": parsedData["@type"],
      };
    }

    if (
      rawAuthenticator.type === "AnyOf" ||
      rawAuthenticator.type === "AllOf"
    ) {
      const subAuthenticators: RawNestedAuthenticator[] = JSON.parse(
        Buffer.from(rawAuthenticator.data, "base64").toString("utf-8")
      );

      return {
        id: rawAuthenticator?.id,
        type: rawAuthenticator.type,
        subAuthenticators: subAuthenticators.map(
          (subAuthenticator: RawNestedAuthenticator) => {
            return parseNestedAuthenticator({
              authenticator: subAuthenticator,
            });
          }
        ),
      };
    }

    throw new Error(`Unknown authenticator type: ${rawAuthenticator.type}`);
  } catch (error) {
    console.error("Error parsing authenticator:", {
      authenticator: rawAuthenticator,
      error,
    });
    throw error;
  }
}

export function parseNestedAuthenticator({
  authenticator: rawNestedAuthenticator,
}: {
  authenticator: RawNestedAuthenticator;
}): NestedAuthenticator {
  try {
    if (rawNestedAuthenticator.authenticator_type === "SignatureVerification") {
      return {
        type: "SignatureVerification",
        publicKey: rawNestedAuthenticator.data,
      };
    }

    if (
      rawNestedAuthenticator.authenticator_type === "CosmwasmAuthenticatorV1"
    ) {
      const parsedData: { contract: string; params: string } = JSON.parse(
        Buffer.from(rawNestedAuthenticator.data, "base64").toString("utf-8")
      );
      const parsedParams = JSON.parse(
        Buffer.from(parsedData.params, "base64").toString("utf-8")
      );
      return {
        type: "CosmwasmAuthenticatorV1",
        contract: parsedData.contract,
        params: parsedParams,
      } as CosmwasmAuthenticatorV1;
    }

    if (rawNestedAuthenticator.authenticator_type === "MessageFilter") {
      const parsedData: { "@type": string } = JSON.parse(
        Buffer.from(rawNestedAuthenticator.data, "base64").toString("utf-8")
      );
      return {
        type: "MessageFilter",
        "@type": parsedData["@type"],
      };
    }

    if (
      rawNestedAuthenticator.authenticator_type === "AnyOf" ||
      rawNestedAuthenticator.authenticator_type === "AllOf"
    ) {
      const subAuthenticators: RawNestedAuthenticator[] = JSON.parse(
        Buffer.from(rawNestedAuthenticator.data, "base64").toString("utf-8")
      );

      return {
        type: rawNestedAuthenticator.authenticator_type,
        subAuthenticators: subAuthenticators.map(
          (subAuthenticator: RawNestedAuthenticator) => {
            return parseNestedAuthenticator({
              authenticator: subAuthenticator,
            });
          }
        ),
      };
    }

    throw new Error(
      `Unknown nested authenticator type: ${rawNestedAuthenticator.authenticator_type}`
    );
  } catch (error) {
    console.error("Error parsing nested authenticator:", {
      authenticator: rawNestedAuthenticator,
      error,
    });
    throw error;
  }
}
