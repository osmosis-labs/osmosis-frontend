import * as legacyKV from "@osmosis-labs/keplr-stores/build/common/kv-store";
import * as tx from "@osmosis-labs/tx";
import * as utils from "@osmosis-labs/utils";

import { getAminoConverters } from "../account/amino-converters";
import { GasMultiplier } from "../account/base";
import { appendFeMemoTag } from "../account/memo";
import * as legacyJoin from "../account/osmosis/join-pool";
import * as legacyAccount from "../account/utils";
import { WalletConnectionInProgressError } from "../account/wallet-errors";
import * as legacyFactories from "../kv-store";
import * as legacyErrors from "../ui-config/errors";
import { trimZerosFromEnd } from "../ui-config/price";

it("retains constructor identity through the former public entrypoints", () => {
  for (const [name, Constructor] of Object.entries(legacyErrors)) {
    expect(Constructor).toBe(utils[name as keyof typeof utils]);
    expect(new Constructor("message")).toBeInstanceOf(Constructor);
  }
  expect(WalletConnectionInProgressError).toBe(
    utils.WalletConnectionInProgressError
  );
  expect(legacyAccount.InsufficientFeeError).toBe(utils.InsufficientFeeError);
  expect(legacyAccount.AccountStoreNoBroadcastErrorEvent).toBe(
    utils.AccountStoreNoBroadcastErrorEvent
  );
  expect(legacyKV.MemoryKVStore).toBe(utils.MemoryKVStore);
  expect(legacyKV.LocalKVStore).toBe(utils.LocalKVStore);
  expect(legacyKV.IndexedDBKVStore).toBe(utils.IndexedDBKVStore);
});

it("re-exports the same helpers and factories", () => {
  expect(appendFeMemoTag).toBe(tx.appendFeMemoTag);
  expect(getAminoConverters).toBe(tx.getAminoConverters);
  expect(GasMultiplier).toBe(tx.GasMultiplier);
  expect(trimZerosFromEnd).toBe(utils.trimZerosFromEnd);
  expect(legacyFactories.makeIndexedKVStore).toBe(utils.makeIndexedKVStore);
  expect(legacyFactories.makeLocalStorageKVStore).toBe(
    utils.makeLocalStorageKVStore
  );
  for (const [name, helper] of Object.entries(legacyJoin)) {
    expect(helper).toBe(tx[name as keyof typeof tx]);
  }
});
