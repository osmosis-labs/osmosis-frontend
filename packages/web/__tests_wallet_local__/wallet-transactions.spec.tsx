import { readFileSync } from "node:fs";

import { Secp256k1HdWallet } from "@cosmjs/amino";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import {
  ChainWalletBase,
  MainWalletBase,
  type Wallet,
  type WalletClient,
} from "@cosmos-kit/core";
import { BigDec } from "@osmosis-labs/math";
import { AccountStore, ChainStore } from "@osmosis-labs/stores";
import {
  type DeliverTxResponse,
  makeSwapExactAmountInMsg,
  prepareCollectAllPositionsRewardsMsgs,
  prepareCreateBalancerPoolMsg,
  prepareCreateConcentratedLiquidityPositionMsg,
  prepareCreateConcentratedPoolMsg,
  prepareExitPoolMsg,
  prepareJoinPoolMsg,
  prepareWithdrawConcentratedLiquidityPositionMsg,
  type WalletTxTransport,
} from "@osmosis-labs/tx";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { ApiClientError } from "@osmosis-labs/utils";
import { act, renderHook } from "@testing-library/react";
import type { NextApiRequest, NextApiResponse } from "next";
import { createElement, type PropsWithChildren } from "react";
import WebSocket from "ws";

import { ChainInfos } from "~/config/chain";
import { ChainList } from "~/config/generated/chain-list";
import { withCosmosKitFields } from "~/config/keplr-chain";
import { useWallet } from "~/hooks/use-wallet";
import { broadcastTransactionHandler as broadcastHandler } from "~/pages/api/broadcast-transaction";
import estimateHandler from "~/pages/api/estimate-gas-fee";
import migrationHandler from "~/pages/api/simulate-position-migration";
import { storeContext } from "~/stores";
import type { RootStore } from "~/stores/root";
import { WalletRuntime } from "~/stores/wallet-runtime";

jest.mock("~/config/generated/chain-list", () => {
  const original = jest.requireActual("~/config/generated/chain-list");
  const fixture = JSON.parse(
    require("node:fs").readFileSync(
      process.env.WALLET_LOCAL_CHAIN_FIXTURE!,
      "utf8"
    )
  );
  const osmosis = original.ChainList.find(
    (chain: { chain_name: string }) => chain.chain_name === "osmosis"
  );
  return {
    ChainList: [
      {
        ...osmosis,
        chain_id: fixture.chainId,
        apis: {
          rpc: [{ address: "http://127.0.0.1:1" }, { address: fixture.rpc }],
          rest: [{ address: "http://127.0.0.1:1" }, { address: fixture.rest }],
        },
      },
    ],
  };
});

jest.mock("~/config/generated/asset-lists", () => {
  const original = jest.requireActual("~/config/generated/asset-lists");
  const fixture = JSON.parse(
    require("node:fs").readFileSync(
      process.env.WALLET_LOCAL_CHAIN_FIXTURE!,
      "utf8"
    )
  );
  return {
    AssetLists: original.AssetLists.filter(
      (list: { chain_name: string }) => list.chain_name === "osmosis"
    ).map((list: object) => ({ ...list, chain_id: fixture.chainId })),
  };
});

const fixture = JSON.parse(
  readFileSync(process.env.WALLET_LOCAL_CHAIN_FIXTURE!, "utf8")
) as {
  chainId: string;
  rpc: string;
  rest: string;
  accounts: Record<"amino" | "direct", { address: string; mnemonic: string }>;
};
const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const ion = { coinDenom: "ION", coinMinimalDenom: "uion", coinDecimals: 6 };

const transport: WalletTxTransport = {
  get: async <T,>(url: string) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok && response.status !== 404)
      throw new Error(`Account query failed: ${response.status}`);
    return { data: (await response.json()) as T };
  },
  post: async <T,>(_url: string, data: unknown) => {
    const response = await broadcastHandler(
      new Request("http://wallet-ci/api/broadcast-transaction", {
        method: "POST",
        body: JSON.stringify(data),
      })
    );
    if (!response.ok)
      throw new Error(`Broadcast handler failed: ${await response.text()}`);
    return { data: (await response.json()) as T };
  },
  request: async <T,>(
    url: string,
    options: { data: Record<string, unknown> }
  ) => {
    let status = 200;
    let data: unknown;
    const res = {
      status: (code: number) => {
        status = code;
        return res;
      },
      json: (body: unknown) => {
        data = body;
        return res;
      },
    };
    const handler =
      url === "/api/estimate-gas-fee" ? estimateHandler : migrationHandler;
    await handler(
      { method: "POST", body: options.data } as NextApiRequest,
      res as unknown as NextApiResponse
    );
    if (status >= 400)
      throw new ApiClientError({
        message: `Handler returned ${status}`,
        data,
        response: new Response(JSON.stringify(data), { status }),
      });
    return data as T;
  },
};

class FixtureWallet extends MainWalletBase {
  constructor(
    info: Wallet,
    private readonly signer: Secp256k1HdWallet | DirectSecp256k1HdWallet
  ) {
    super(info, ChainWalletBase);
  }
  async initClient() {
    this.initingClient();
    const [account] = await this.signer.getAccounts();
    const client = {
      enable: async () => {},
      addChain: async () => {},
      getSimpleAccount: async (chainId: string) => ({
        namespace: "cosmos",
        chainId,
        address: account.address,
        username: "fixture",
      }),
      getAccount: async () => ({ ...account, username: "fixture" }),
      getOfflineSigner: () => this.signer,
      ...("signAmino" in this.signer
        ? {
            signAmino: async (
              _chain: string,
              address: string,
              doc: Parameters<Secp256k1HdWallet["signAmino"]>[1]
            ) => (this.signer as Secp256k1HdWallet).signAmino(address, doc),
          }
        : {}),
    } as WalletClient;
    this.initClientDone(client);
  }
}

const poolIdFrom = (tx: DeliverTxResponse) => {
  const value = tx.events
    ?.find((event) => event.type === "pool_created")
    ?.attributes.find(({ key }) => key === "pool_id")?.value;
  if (!value) throw new Error(`No pool id in ${JSON.stringify(tx.events)}`);
  return value;
};

it.each(["amino", "direct"] as const)(
  "estimates, signs and includes %s swaps and liquidity operations through useWallet",
  async (mode) => {
    const signer = await (
      mode === "amino" ? Secp256k1HdWallet : DirectSecp256k1HdWallet
    ).fromMnemonic(fixture.accounts[mode].mnemonic, { prefix: "osmo" });
    const info: Wallet = {
      name: `fixture-${mode}`,
      prettyName: "Local fixture",
      mode: "extension",
      mobileDisabled: true,
    };
    const accounts = new AccountStore(
      ChainList.map(withCosmosKitFields),
      fixture.chainId,
      [],
      [new FixtureWallet(info, signer)],
      new ChainStore(ChainInfos, fixture.chainId)
    );
    const runtime = new WalletRuntime(
      accounts as unknown as RootStore["accountStore"],
      { wsObject: WebSocket as unknown as typeof globalThis.WebSocket },
      transport
    );
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        storeContext.Provider,
        { value: { walletRuntime: runtime } as RootStore },
        children
      );
    const hook = renderHook(() => useWallet(fixture.chainId), { wrapper });
    const send = async (
      ...args: Parameters<typeof hook.result.current.signAndBroadcast>
    ) => {
      let included: DeliverTxResponse | undefined;
      await act(async () => {
        await hook.result.current.signAndBroadcast(
          args[0],
          args[1],
          args[2],
          args[3],
          { ...args[4], preferNoSetFee: true },
          {
            onFulfill: (tx) => {
              included = tx;
            },
          }
        );
      });
      expect(included?.code).toBe(0);
      expect(Number(included?.height)).toBeGreaterThan(0);
      const deadline = Date.now() + 10_000;
      let indexed: { tx_result: { code: number } } | undefined;
      while (Date.now() < deadline) {
        const response = await fetch(
          `${fixture.rpc}/tx?hash=0x${included!.transactionHash}`,
          { signal: AbortSignal.timeout(1_000) }
        );
        indexed = (await response.json()).result;
        if (indexed) break;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      expect(indexed?.tx_result.code).toBe(0);
      expect(hook.result.current.txTypeInProgress).toBe("");
      return included!;
    };
    try {
      await act(async () => {
        await runtime.mount();
        await hook.result.current.connect(info.name, true);
      });
      expect(hook.result.current.address).toBe(fixture.accounts[mode].address);
      // Prove the hook does not route signing back through AccountStore.
      jest.spyOn(accounts, "signAndBroadcast").mockImplementation(() => {
        throw new Error("Legacy signing was used");
      });
      const context = {
        ...hook.result.current.transactionContext,
        findCurrency: (denom: string) =>
          [osmo, ion].find((currency) => currency.coinMinimalDenom === denom),
      };
      const created = await send(
        ...(await prepareCreateBalancerPoolMsg(context, "0.3", [
          { weight: "1", token: { currency: osmo, amount: "100" } },
          { weight: "1", token: { currency: ion, amount: "100" } },
        ]))
      );
      const poolId = poolIdFrom(created);
      const swap = await makeSwapExactAmountInMsg({
        userOsmoAddress: context.address,
        pools: [{ id: poolId, tokenOutDenom: "uion" }],
        tokenIn: { coinMinimalDenom: "uosmo", amount: "1000000" },
        tokenOutMinAmount: "1",
      });
      const estimated = await hook.result.current.estimateFee({
        messages: [swap],
        signOptions: { preferNoSetFee: true },
      });
      expect(Number(estimated.gas)).toBeGreaterThan(0);
      await send("swap", [swap], "local-chain swap", estimated, {
        preferNoSetFee: true,
      });
      const pool = await (
        await fetch(`${fixture.rest}/osmosis/gamm/v1beta1/pools/${poolId}`)
      ).json();
      const data = {
        id: poolId,
        type: "weighted" as const,
        totalShare: new CoinPretty(
          {
            coinDenom: "GAMM",
            coinMinimalDenom: `gamm/pool/${poolId}`,
            coinDecimals: 18,
          },
          new Int(pool.pool.total_shares.amount)
        ),
        assets: pool.pool.pool_assets.map((asset: any) => ({
          amount: new CoinPretty(
            [osmo, ion].find(
              (currency) => currency.coinMinimalDenom === asset.token.denom
            )!,
            new Int(asset.token.amount)
          ),
          weight: new Int(asset.weight),
        })),
        totalWeight: new Int(pool.pool.total_weight),
        swapFee: new Dec(pool.pool.pool_params.swap_fee),
      };
      await send(...(await prepareJoinPoolMsg(context, poolId, data, "1")));
      await send(
        ...(await prepareExitPoolMsg(
          context,
          poolId,
          "0.5",
          new Int(pool.pool.total_shares.amount),
          pool.pool.pool_assets.map((asset: any) => asset.token),
          new Dec("0")
        ))
      );
      const clPool = poolIdFrom(
        await send(
          ...(await prepareCreateConcentratedPoolMsg(
            context,
            "uion",
            "uosmo",
            100,
            0.003
          ))
        )
      );
      const positionTx = await send(
        ...(await prepareCreateConcentratedLiquidityPositionMsg(
          context,
          clPool,
          { tickSpacing: 100, currentSqrtPrice: new BigDec(0) },
          new Int(-108_000_000),
          new Int(342_000_000),
          undefined,
          { currency: ion, amount: "10" },
          { currency: osmo, amount: "10" }
        ))
      );
      const positionId = positionTx.events
        ?.find((event) => event.type === "create_position")
        ?.attributes.find(({ key }) => key === "position_id")?.value;
      expect(positionId).toBeDefined();
      await send(
        ...(await prepareCollectAllPositionsRewardsMsgs(
          context,
          [positionId!],
          []
        ))
      );
      const position = await (
        await fetch(
          `${fixture.rest}/osmosis/concentratedliquidity/v1beta1/position_by_id?position_id=${positionId}`
        )
      ).json();
      const withdrawal = await prepareWithdrawConcentratedLiquidityPositionMsg(
        context,
        positionId!,
        new Dec(position.position.position.liquidity)
      );
      const messages =
        typeof withdrawal[1] === "function"
          ? await withdrawal[1]()
          : withdrawal[1];
      const simulation = await hook.result.current.simulatePositionMigration({
        messages,
      });
      expect(simulation.gasUsed).toBeGreaterThan(0);
      expect(
        simulation.events.some(({ type }) => type === "withdraw_position")
      ).toBe(true);
      await send(...withdrawal);
    } finally {
      hook.unmount();
      await runtime.unmount();
      localStorage.clear();
    }
  }
);
