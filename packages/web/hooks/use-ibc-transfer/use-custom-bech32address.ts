import { Bech32Address } from "@keplr-wallet/cosmos";
import { useCallback, useState } from "react";

/**
 * Store state for using a custom & validated Bech32 address. Address starts as `""`.
 * @returns [customBech32Address, isValid, setCustomBech32Address]
 */
export function useCustomBech32Address(): [
  string,
  boolean,
  (newCustomBech32Address: string, prefix: string) => void
] {
  const [customBech32Address, setCustomBech32Address] = useState<string>("");
  const [isValid, setIsValid] = useState(true);

  return [
    customBech32Address,
    isValid,
    useCallback(
      (newCustomBech32Address: string, prefix: string) => {
        let didThrow = false;
        try {
          Bech32Address.validate(newCustomBech32Address, prefix);
        } catch (e) {
          setIsValid(false);
          didThrow = true;
        }
        if (!didThrow) {
          setIsValid(true);
        }
        setCustomBech32Address(newCustomBech32Address);
      },
      [setIsValid, setCustomBech32Address]
    ),
  ];
}
