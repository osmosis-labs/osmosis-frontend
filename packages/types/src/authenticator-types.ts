export type AuthenticatorType =
  | "SignatureVerification"
  | "AnyOf"
  | "AllOf"
  | "MessageFilter"
  | "CosmwasmAuthenticatorV1";

export interface RawAuthenticator {
  id: string;
  config: string;
  type: AuthenticatorType;
}

export interface RawNestedAuthenticator {
  config: string;
  type: AuthenticatorType;
}

export interface MessageFilterAuthenticator {
  id: string;
  type: "MessageFilter";
  // Allowed message
  "@type": string;
}

export interface CosmwasmAuthenticatorV1 {
  id: string;
  type: "CosmwasmAuthenticatorV1";
  // Contract address
  contract: string;
  params: Record<string, any>;
}
export interface SignatureVerificationAuthenticator {
  id: string;
  type: "SignatureVerification";
  publicKey: string;
}

export type NestedAuthenticator =
  | Omit<SignatureVerificationAuthenticator, "id">
  | Omit<CosmwasmAuthenticatorV1, "id">
  | Omit<MessageFilterAuthenticator, "id">
  | Omit<AnyOfAuthenticator, "id">
  | Omit<AllOfAuthenticator, "id">;

export interface AnyOfAuthenticator {
  id: string;
  type: "AnyOf";
  subAuthenticators: NestedAuthenticator[];
}

export interface AllOfAuthenticator {
  id: string;
  type: "AllOf";
  subAuthenticators: NestedAuthenticator[];
}

export type ParsedAuthenticator =
  | AnyOfAuthenticator
  | AllOfAuthenticator
  | SignatureVerificationAuthenticator
  | MessageFilterAuthenticator
  | CosmwasmAuthenticatorV1;
