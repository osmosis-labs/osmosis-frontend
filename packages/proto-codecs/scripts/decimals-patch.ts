/**
 * This class patch is required to override Telescope number handling.
 * Following Osmosis v26, which includes the new Cosmos SDK, we need to handle
 * numbers in a different way. Specifically, we need to omit periods in the
 * number representation to ensure compatibility with the updated SDK.
 * This patch ensures that the Decimal class processes numbers correctly
 * according to the new requirements.
 */

const maxFractionalDigits = 30;
export class Decimal {
  public static fromUserInput(
    input: string,
    fractionalDigits: number
  ): Decimal {
    Decimal.verifyFractionalDigits(fractionalDigits);
    const badCharacter = input.match(/[^0-9.]/);
    if (badCharacter) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      throw new Error(
        `Invalid character at position ${badCharacter.index! + 1}`
      );
    }
    let whole: string;
    let fractional: string;
    if (input === "") {
      whole = "0";
      fractional = "";
    } else if (input.search(/\./) === -1) {
      // integer format, no separator
      whole = input;
      fractional = "";
    } else {
      const parts = input.split(".");
      switch (parts.length) {
        case 0:
        case 1:
          throw new Error(
            "Fewer than two elements in split result. This must not happen here."
          );
        case 2:
          if (!parts[1]) throw new Error("Fractional part missing");
          whole = parts[0];
          fractional = parts[1].replace(/0+$/, "");
          break;
        default:
          throw new Error("More than one separator found");
      }
    }
    if (fractional.length > fractionalDigits) {
      throw new Error("Got more fractional digits than supported");
    }
    const quantity = `${whole}${fractional.padEnd(fractionalDigits, "0")}`;
    return new Decimal(quantity, fractionalDigits);
  }
  public static fromAtomics(
    atomics: string,
    fractionalDigits: number
  ): Decimal {
    Decimal.verifyFractionalDigits(fractionalDigits);
    return new Decimal(atomics, fractionalDigits);
  }
  private static verifyFractionalDigits(fractionalDigits: number): void {
    if (!Number.isInteger(fractionalDigits))
      throw new Error("Fractional digits is not an integer");
    if (fractionalDigits < 0)
      throw new Error("Fractional digits must not be negative");
    if (fractionalDigits > maxFractionalDigits) {
      throw new Error(
        `Fractional digits must not exceed ${maxFractionalDigits}`
      );
    }
  }
  public get atomics(): string {
    return this.data.atomics.toString();
  }
  public get fractionalDigits(): number {
    return this.data.fractionalDigits;
  }
  private readonly data: {
    readonly atomics: bigint;
    readonly fractionalDigits: number;
  };
  private constructor(atomics: string, fractionalDigits: number) {
    if (!atomics.match(/^[0-9]+$/)) {
      throw new Error(
        "Invalid string format. Only non-negative integers in decimal representation supported."
      );
    }
    this.data = {
      atomics: BigInt(atomics),
      fractionalDigits: fractionalDigits,
    };
  }
  public toString(): string {
    return this.atomics;
  }
}
