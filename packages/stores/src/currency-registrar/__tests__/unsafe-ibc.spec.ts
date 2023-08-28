import { ChainInfoInner, ChainStore } from "@keplr-wallet/stores";
import { ChainInfo, IBCCurrency } from "@keplr-wallet/types";

import { makeIBCMinimalDenom, UnsafeIbcCurrencyRegistrar } from "../unsafe-ibc"; // make sure to import your class correctly
import { mockChainInfos, mockIbcAssets } from "./mock-data";

describe("UnsafeIbcCurrencyRegistrar", () => {
  let chainStoreMock: ChainStore;
  const osmosisChainIdMock = mockChainInfos[0].chainId;
  let osmosisChain: ChainInfoInner<ChainInfo>;

  beforeEach(() => {
    // Setup a chainStore mock object
    chainStoreMock = new ChainStore(mockChainInfos);
    osmosisChain = chainStoreMock.getChain(osmosisChainIdMock);

    // Initialize the registrar with the mock data, which will register itself with chain store
    new UnsafeIbcCurrencyRegistrar(
      chainStoreMock,
      mockIbcAssets,
      osmosisChainIdMock
    );
  });

  test("correctly handles normal IBC currency", () => {
    const atomOnOsmosisDenom =
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
    osmosisChain.addUnknownCurrencies(atomOnOsmosisDenom);
    const atomCurrencyOnOsmosis = osmosisChain.findCurrency(
      atomOnOsmosisDenom
    ) as IBCCurrency;

    const atomOnCosmos = "uatom";

    expect(atomCurrencyOnOsmosis).toBeDefined();
    expect(atomCurrencyOnOsmosis.originCurrency).toBeDefined();
    expect(atomCurrencyOnOsmosis.originCurrency?.coinMinimalDenom).toBe(
      atomOnCosmos
    );

    // expect the origin currency not to be on osmosis chain
    const atomOriginCurrencyOnOsmosis =
      osmosisChain.findCurrency(atomOnOsmosisDenom);

    expect(atomOriginCurrencyOnOsmosis?.coinMinimalDenom).not.toBe(
      atomOnCosmos
    );

    // but do expect it to be on the origin chain
    const cosmosChain = chainStoreMock.getChain("cosmoshub-4");
    const atomOnCosmosCurrency = cosmosChain.findCurrency(atomOnCosmos);
    expect(atomOnCosmosCurrency).toBeDefined();
  });

  test("correctly handles multihop IBC currency", () => {
    const pstakeOnOsmosisDenom =
      "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961";
    osmosisChain.addUnknownCurrencies(pstakeOnOsmosisDenom);
    const pstakeCurrencyOnOsmosis = osmosisChain.findCurrency(
      pstakeOnOsmosisDenom
    ) as IBCCurrency;

    const pstakeCurrencyOnCosmos =
      "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444";

    expect(pstakeCurrencyOnOsmosis).toBeDefined();
    expect(pstakeCurrencyOnOsmosis.originCurrency).toBeDefined();
    expect(pstakeCurrencyOnOsmosis.originCurrency?.coinMinimalDenom).toBe(
      pstakeCurrencyOnCosmos
    );

    // expect the origin currency not to be on osmosis chain
    const pstakeOriginCurrencyOnOsmosis =
      osmosisChain.findCurrency(pstakeOnOsmosisDenom);

    expect(pstakeOriginCurrencyOnOsmosis?.coinMinimalDenom).not.toBe(
      pstakeCurrencyOnCosmos
    );
  });

  test("correctly handles CW20 IBC currency", () => {
    // Configure getChain and osmosisIbcAssetsMock so that the currency is known
    // Call unsafeRegisterIbcCurrency with the IBC hash denom of the known currency
    // Expect the result to be the correctly constructed AppCurrency object
    const shdOnOsmosisDenom =
      "ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A";
    osmosisChain.addUnknownCurrencies(shdOnOsmosisDenom);
    const shdCurrencyOnOsmosis = osmosisChain.findCurrency(
      shdOnOsmosisDenom
    ) as IBCCurrency;

    const shdOnCosmos =
      "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm:SHD";

    expect(shdCurrencyOnOsmosis).toBeDefined();
    expect(shdCurrencyOnOsmosis.originCurrency).toBeDefined();
    expect(shdCurrencyOnOsmosis.originCurrency?.coinMinimalDenom).toContain(
      shdOnCosmos
    );

    // expect the origin currency not to be on osmosis chain
    const shdOriginCurrencyOnOsmosis =
      osmosisChain.findCurrency(shdOnOsmosisDenom);

    expect(shdOriginCurrencyOnOsmosis?.coinMinimalDenom).not.toBe(shdOnCosmos);

    // but do expect it to be on the origin chain
    const cosmosChain = chainStoreMock.getChain("cosmoshub-4");
    const shdOnCosmosCurrency = cosmosChain.findCurrency(shdOnCosmos);
    expect(shdOnCosmosCurrency).toBeDefined();
  });

  test("correctly handles unknown IBC currency", () => {
    // Call unsafeRegisterIbcCurrency with an IBC hash denom that isn't in osmosisIbcAssetsMock
    const unknownIbcDenom =
      "ibc/A6E3AF63B3C906416A9AF7A5599959EA4BD50E617EFFE6299B99700CCB780E444";
    osmosisChain.addUnknownCurrencies(unknownIbcDenom);
    const unknownCurrencyOnOsmosis = osmosisChain.findCurrency(
      unknownIbcDenom
    ) as IBCCurrency;

    // Expect the result to be an object representing an unknown currency
    expect(unknownCurrencyOnOsmosis).toBeDefined();
    expect(unknownCurrencyOnOsmosis.coinDenom).toBe("IBC/A6E3");
    expect(unknownCurrencyOnOsmosis.coinDecimals).toBe(0);
    expect(unknownCurrencyOnOsmosis.coinMinimalDenom).toBe(unknownIbcDenom);
  });
});

describe("makeIBCMinimalDenom", () => {
  test("correctly constructs IBC minimal denom", () => {
    // Call makeIBCMinimalDenom with a channelId and coinMinimalDenom
    // Expect the result to be the correctly computed IBC minimal denom
    const ibcAsset_Pstake = {
      counterpartyChainId: "core-1",
      sourceChannelId: "channel-4",
      destChannelId: "channel-6",
      coinMinimalDenom:
        "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
      ibcTransferPathDenom:
        "transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
      isVerified: true,
    };
    const ibcDenom = makeIBCMinimalDenom(
      ibcAsset_Pstake.sourceChannelId,
      ibcAsset_Pstake.ibcTransferPathDenom
    );

    // IBC denom on osmosis
    expect(ibcDenom).toEqual(
      "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961"
    );
  });
});
