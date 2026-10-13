import { encodeAssetList } from "../compact-asset-list";
import { loadBuildAssetList } from "../load-asset-list";

const list = { chainName: "osmosis", assets: [] };
const options = {
  chainId: "osmosis-1",
  commitHash: "pinned-revision",
  isNotFound: (error: unknown) =>
    (error as { status?: number })?.status === 404,
};

it("prefers compact data at the pinned revision", async () => {
  const queryFile = jest.fn().mockResolvedValue(encodeAssetList(list));
  expect(await loadBuildAssetList({ ...options, queryFile })).toEqual(list);
  expect(queryFile).toHaveBeenCalledTimes(1);
  expect(queryFile).toHaveBeenCalledWith(
    "osmosis-1/generated/frontend/assetlist.compact.json",
    "pinned-revision"
  );
});

it("falls back only on 404 and keeps the exact same revision", async () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const queryFile = jest
      .fn()
      .mockRejectedValueOnce({ status: 404 })
      .mockResolvedValueOnce(list);
    expect(await loadBuildAssetList({ ...options, queryFile })).toEqual(list);
    expect(queryFile.mock.calls).toEqual([
      [
        "osmosis-1/generated/frontend/assetlist.compact.json",
        "pinned-revision",
      ],
      ["osmosis-1/generated/frontend/assetlist.json", "pinned-revision"],
    ]);
  } finally {
    warn.mockRestore();
  }
});

it.each([429, 500, undefined])(
  "does not hide failed requests (%s)",
  async (status) => {
    const error = { status };
    const queryFile = jest.fn().mockRejectedValue(error);
    await expect(loadBuildAssetList({ ...options, queryFile })).rejects.toBe(
      error
    );
    expect(queryFile).toHaveBeenCalledTimes(1);
  }
);

it("does not hide malformed compact data or unknown versions", async () => {
  const queryFile = jest
    .fn()
    .mockResolvedValue({ ...encodeAssetList(list), format: "v2" });
  await expect(loadBuildAssetList({ ...options, queryFile })).rejects.toThrow(
    "Invalid compact"
  );
  expect(queryFile).toHaveBeenCalledTimes(1);
});
