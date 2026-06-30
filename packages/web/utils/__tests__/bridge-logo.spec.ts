import { getExternalInterfaceLogo } from "../bridge";

describe("getExternalInterfaceLogo", () => {
  it("returns the brand logo for a mapped connector name", () => {
    expect(getExternalInterfaceLogo("Osmosis Wormhole Connect")).toBe(
      "/bridges/wormhole.svg"
    );
    expect(getExternalInterfaceLogo("Squid")).toBe("/bridges/squid.svg");
  });

  it("falls back to the Generic placeholder for an unmapped connector", () => {
    // Connectors whose brand asset isn't sourced yet (MTN-196 follow-up).
    expect(getExternalInterfaceLogo("Omnity Bridge")).toBe(
      "/external-bridges/generic.svg"
    );
    expect(getExternalInterfaceLogo("Sologenic TX Bridge")).toBe(
      "/external-bridges/generic.svg"
    );
    // "Dymension Portal" must NOT borrow the Wormhole Portal logo.
    expect(getExternalInterfaceLogo("Dymension Portal")).toBe(
      "/external-bridges/generic.svg"
    );
  });

  it("falls back to Generic for an unknown / empty name", () => {
    expect(getExternalInterfaceLogo("Totally New Bridge")).toBe(
      "/external-bridges/generic.svg"
    );
    expect(getExternalInterfaceLogo("")).toBe("/external-bridges/generic.svg");
  });
});
