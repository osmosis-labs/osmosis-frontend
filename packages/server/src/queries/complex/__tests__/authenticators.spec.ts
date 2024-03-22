import { MockChains } from "../../__tests__/mock-chains";
import { getSessionAuthenticator } from "../authenticators";

jest.mock("../authenticators", () => ({
  ...jest.requireActual("../authenticators"),
  getAuthenticators: jest.fn(),
}));

describe("getSessionAuthenticator", () => {
  const mockAuthenticators = [
    {
      id: "1",
      type: "AllOfAuthenticator",
      subAuthenticators: [
        {
          type: "SignatureVerificationAuthenticator",
          publicKey: "publicKey1",
        },
      ],
    },
    {
      id: "2",
      type: "AllOfAuthenticator",
      subAuthenticators: [
        {
          type: "SignatureVerificationAuthenticator",
          publicKey: "publicKey2",
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return undefined if authenticatorId and publicKey are empty", async () => {
    const result = await getSessionAuthenticator({
      userOsmoAddress: "address",
      chainList: MockChains,
    });
    expect(result).toBeUndefined();
  });

  it("should return the authenticator by authenticatorId", async () => {
    const result = await getSessionAuthenticator({
      userOsmoAddress: "address",
      authenticatorId: "1",
      getAuthenticatorsFn: async () => mockAuthenticators as any,
      chainList: MockChains,
    });
    expect(result).toEqual(mockAuthenticators[0]);
  });

  it("should return the authenticator by publicKey", async () => {
    const result = await getSessionAuthenticator({
      userOsmoAddress: "address",
      publicKey: "publicKey2",
      getAuthenticatorsFn: async () => mockAuthenticators as any,
      chainList: MockChains,
    });
    expect(result).toEqual(mockAuthenticators[1]);
  });

  it("should return undefined if the authenticator is not found", async () => {
    const result = await getSessionAuthenticator({
      userOsmoAddress: "address",
      publicKey: "nonExistingPublicKey",
      getAuthenticatorsFn: async () => mockAuthenticators as any,
      chainList: MockChains,
    });
    expect(result).toBeUndefined();
  });
});
