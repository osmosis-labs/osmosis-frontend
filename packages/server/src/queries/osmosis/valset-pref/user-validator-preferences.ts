import { createNodeQuery } from "../../create-node-query";

export type UserValidatorPreferences = {
  preferences: {
    val_oper_address: string;
    // Dec
    weight: string;
  }[];
};

/** Errors when the user has not set any validator preferences. */
export const queryUserValidatorPreferences = createNodeQuery<
  UserValidatorPreferences,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) => `/osmosis/valset-pref/v1beta1/${bech32Address}`,
});
