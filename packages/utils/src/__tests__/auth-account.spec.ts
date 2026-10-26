import { BaseAccount } from "../auth-account";

const address = "osmo19w2t4ue7qpdh6022m3yxmxvv3w7jla7u3hfq0r";
const pubKey = {
  "@type": "/cosmos.crypto.secp256k1.PubKey",
  key: "A8QuPsdLd/p3zQ+6WfgABVIi9DJ2xZ5ll1n+hNXfKD7Z",
};
const base = {
  address,
  pub_key: pubKey,
  account_number: "18446744073709551615",
  sequence: "4982",
};

it.each([
  ["a base account", { "@type": "/cosmos.auth.v1beta1.BaseAccount", ...base }],
  [
    "a vesting account",
    {
      "@type": "/cosmos.vesting.v1beta1.ContinuousVestingAccount",
      base_vesting_account: { base_account: base },
    },
  ],
])("reads the onchain pubkey from %s", (_, account) => {
  const parsed = BaseAccount.fromProtoJSON({ account });
  expect(parsed.getPubKey()).toEqual({
    typeUrl: pubKey["@type"],
    key: pubKey.key,
  });
  expect(parsed.getAccountNumber().toString()).toBe("18446744073709551615");
  expect(parsed.getSequence().toString()).toBe("4982");
});

it("leaves the pubkey unset before the first tx and for multisig keys", () => {
  for (const pub_key of [
    null,
    {
      "@type": "/cosmos.crypto.multisig.LegacyAminoPubKey",
      threshold: 2,
      public_keys: [pubKey],
    },
  ])
    expect(
      BaseAccount.fromProtoJSON({
        account: { ...base, pub_key },
      }).getPubKey()
    ).toBeUndefined();
});
