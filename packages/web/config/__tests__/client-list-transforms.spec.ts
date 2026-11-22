import { getAssetFromAssetList, makeMinimalAsset } from "@osmosis-labs/utils";

import {
  toClientAssetLists,
  toClientChainList,
} from "~/config/client-list-transforms";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import {
  getKeplrCompatibleChain,
  withCosmosKitFields,
} from "~/config/keplr-chain";

describe("client list transforms", () => {
  const clientAssetLists = toClientAssetLists(AssetLists);
  const clientChainList = toClientChainList(ChainList);

  it("strips server-only fields from ClientAssetLists", () => {
    const sample = clientAssetLists
      .flatMap(({ assets }) => assets)
      .find((a) => a.coinMinimalDenom === "uosmo");
    expect(sample).toBeDefined();
    expect("counterparty" in sample!).toBe(false);
    expect("transferMethods" in sample!).toBe(false);
    expect("logoURIs" in sample!).toBe(false);
    expect("categories" in sample!).toBe(false);
    expect(JSON.stringify(clientAssetLists).length).toBeLessThan(
      JSON.stringify(AssetLists).length * 0.5
    );
  });

  it("preserves makeMinimalAsset and getAssetFromAssetList parity", () => {
    for (const denom of ["uosmo", "uion"]) {
      const full = getAssetFromAssetList({
        coinMinimalDenom: denom,
        assetLists: AssetLists,
      });
      const slim = getAssetFromAssetList({
        coinMinimalDenom: denom,
        assetLists: clientAssetLists,
      });
      expect(full).toBeDefined();
      expect(slim).toBeDefined();
      expect(slim!.currency).toEqual(full!.currency);
      expect(makeMinimalAsset(slim!.rawAsset)).toEqual(
        makeMinimalAsset(full!.rawAsset)
      );
    }
  });

  it("preserves Keplr and CosmosKit chain derivation parity", () => {
    const fullOsmo = ChainList[0];
    const slimOsmo = clientChainList[0];

    expect("description" in slimOsmo).toBe(false);
    expect("logo_URIs" in slimOsmo).toBe(false);

    expect(
      getKeplrCompatibleChain({
        chain: slimOsmo,
        assetLists: clientAssetLists,
      })
    ).toEqual(
      getKeplrCompatibleChain({
        chain: fullOsmo,
        assetLists: AssetLists,
      })
    );

    expect(withCosmosKitFields(slimOsmo).fees).toEqual(
      withCosmosKitFields(fullOsmo).fees
    );
    expect(withCosmosKitFields(slimOsmo).staking).toEqual(
      withCosmosKitFields(fullOsmo).staking
    );
  });
});
