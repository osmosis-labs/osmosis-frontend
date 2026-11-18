import { AssetLists as MockAssetLists } from "../../../__tests__/mock-asset-lists";
import { MockChains } from "../../../__tests__/mock-chains";
import { queryTransactions } from "../../../data-services";
import { getTransactions } from "../transactions";
import { IndexedTransferTxs } from "./transfer-fixtures";

jest.mock("../../../data-services", () => ({
  ...jest.requireActual("../../../data-services"),
  queryTransactions: jest.fn(),
}));

const mockedQueryTransactions = jest.mocked(queryTransactions);

const address = "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj";

// the fixtures transfer to and from Noble, which the mock chain list lacks
const chainList = [
  ...MockChains,
  {
    ...MockChains.find((c) => c.chain_name === "cosmoshub")!,
    chain_name: "noble",
    chain_id: "noble-1",
    bech32Prefix: "noble",
    prettyName: "Noble",
  },
];

describe("getTransactions types", () => {
  beforeEach(() => {
    mockedQueryTransactions.mockReset();
    // a send and an arrival for `address`
    mockedQueryTransactions.mockResolvedValue([
      IndexedTransferTxs.send,
      IndexedTransferTxs.recv,
    ]);
  });

  const get = (types?: ("swap" | "deposit" | "withdraw")[], page = "0") =>
    getTransactions({
      address,
      page,
      assetLists: MockAssetLists,
      chainList,
      types,
    });

  it("requests the message types of the selected types only", async () => {
    await get(["deposit"], "1");

    expect(mockedQueryTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        messageTypes: ["/ibc.core.channel.v1.MsgRecvPacket"],
      })
    );
  });

  it("requests swaps and both transfer directions by default", async () => {
    await get(undefined, "2");

    const { messageTypes } = mockedQueryTransactions.mock.calls[0][0];
    expect(messageTypes).toEqual(
      expect.arrayContaining([
        "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
        "/ibc.core.channel.v1.MsgRecvPacket",
        "/ibc.applications.transfer.v1.MsgTransfer",
        "/cosmwasm.wasm.v1.MsgExecuteContract",
      ])
    );
  });

  it("returns only the selected types", async () => {
    const res = await get(["withdraw"], "3");

    expect(res.transfers.map((t) => t.direction)).toEqual(["withdraw"]);
    expect(res.transactions).toEqual([]);
  });

  it("returns nothing without calling the API when no type is selected", async () => {
    const res = await get([], "4");

    expect(mockedQueryTransactions).not.toHaveBeenCalled();
    expect(res).toEqual({
      transactions: [],
      transfers: [],
      hasNextPage: false,
    });
  });
});
