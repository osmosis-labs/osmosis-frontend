// Polyfill for TextEncoder and TextDecoder
import { TextDecoder, TextEncoder } from "util";

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

import { shorten } from "../string";

describe("shorten", () => {
  it("should return an empty string if input is empty", () => {
    expect(shorten("")).toBe("");
  });

  it("should return the original string if it is shorter than the combined prefix and suffix length", () => {
    expect(shorten("short", { prefixLength: 3, suffixLength: 3 })).toBe(
      "short"
    );
  });

  it("should return the original string if it is exactly the combined prefix and suffix length", () => {
    expect(shorten("exactly", { prefixLength: 3, suffixLength: 4 })).toBe(
      "exactly"
    );
  });

  it("should shorten the string with default options", () => {
    expect(shorten("thisisaverylongstring")).toBe("thisis...tring");
  });

  it("should shorten the string with custom prefix and suffix lengths", () => {
    expect(
      shorten("thisisaverylongstring", { prefixLength: 4, suffixLength: 6 })
    ).toBe("this...string");
  });

  it("should shorten the string with a custom delimiter", () => {
    expect(
      shorten("thisisaverylongstring", {
        prefixLength: 4,
        suffixLength: 6,
        delim: "---",
      })
    ).toBe("this---string");
  });

  it("should handle edge cases where prefix or suffix is empty", () => {
    expect(
      shorten("thisisaverylongstring", { prefixLength: 0, suffixLength: 6 })
    ).toBe("...string");
    expect(
      shorten("thisisaverylongstring", { prefixLength: 4, suffixLength: 0 })
    ).toBe("this...");
  });
});
