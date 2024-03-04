export type AuthenticatorType =
  | "SignatureVerificationAuthenticator"
  | "AnyOfAuthenticator"
  | "AllOfAuthenticator"
  | "MessageFilterAuthenticator"
  | "CosmwasmAuthenticatorV1";

export interface RawAuthenticator {
  id: string;
  data: string;
  type: AuthenticatorType;
}

export interface RawNestedAuthenticator {
  data: string;
  authenticator_type: AuthenticatorType;
}

export interface MessageFilterAuthenticator {
  id: string;
  type: "MessageFilterAuthenticator";
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
  type: "SignatureVerificationAuthenticator";
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
  type: "AnyOfAuthenticator";
  subAuthenticators: NestedAuthenticator[];
}

export interface AllOfAuthenticator {
  id: string;
  type: "AllOfAuthenticator";
  subAuthenticators: NestedAuthenticator[];
}

export type ParsedAuthenticator =
  | AnyOfAuthenticator
  | AllOfAuthenticator
  | SignatureVerificationAuthenticator
  | MessageFilterAuthenticator
  | CosmwasmAuthenticatorV1;
