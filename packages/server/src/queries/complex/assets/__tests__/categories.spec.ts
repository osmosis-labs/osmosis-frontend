import dayjs from "../../../../utils/dayjs";
import { AssetLists } from "../../../__tests__/mock-asset-lists";
import { isAssetInCategories } from "../categories";

const assets = AssetLists.flatMap(({ assets }) => assets);

describe("isAssetInCategories", () => {
  it("should correctly filter new assets with default newness", () => {
    const newAssets = assets.filter((asset) =>
      isAssetInCategories(asset, ["new"], undefined, dayjs("2024-02-22"))
    );

    expect(newAssets.some((asset) => asset.symbol === "stDYDX")).toBeTruthy();
    expect(newAssets.some((asset) => asset.symbol === "sqTIA")).toBeFalsy();
  });
  it("should correctly filter new assets with extended newness", () => {
    const newAssets = assets.filter((asset) =>
      isAssetInCategories(
        asset,
        ["new"],
        dayjs.duration({ years: 1 }),
        dayjs("2024-02-22")
      )
    );

    expect(newAssets.some((asset) => asset.symbol === "stDYDX")).toBeTruthy();
    expect(newAssets.some((asset) => asset.symbol === "sqTIA")).toBeTruthy();
  });
  it("should correctly filter assets by categories", () => {
    const a = assets.filter((asset) =>
      isAssetInCategories(
        asset,
        ["new", "meme"],
        undefined,
        dayjs("2024-02-22")
      )
    );

    expect(a.some((asset) => asset.symbol === "stDYDX")).toBeTruthy(); // new
    expect(a.some((asset) => asset.symbol === "sqTIA")).toBeFalsy(); // too old, and defi
    expect(a.some((asset) => asset.symbol === "OSMO")).toBeFalsy(); // defi
    expect(a.some((asset) => asset.symbol === "RAPTR")).toBeTruthy(); // no listing date, meme
  });
  it("should correctly filter assets by categories, without new", () => {
    const a = assets.filter((asset) =>
      isAssetInCategories(asset, ["meme"], undefined, dayjs("2024-02-22"))
    );

    expect(a.some((asset) => asset.symbol === "stDYDX")).toBeFalsy(); // new
    expect(a.some((asset) => asset.symbol === "sqTIA")).toBeFalsy(); // too old, and defi
    expect(a.some((asset) => asset.symbol === "OSMO")).toBeFalsy(); // defi
    expect(a.some((asset) => asset.symbol === "RAPTR")).toBeTruthy(); // no listing date, meme
  });
});
