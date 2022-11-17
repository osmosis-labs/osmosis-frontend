import { CoinPrimitive } from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import classNames from "classnames";
import { request, gql } from "graphql-request";

import { REGISTRY_ADDRESSES, SUBQUERY_ENDPOINTS } from "../../config";
import { useWindowSize } from "../../hooks";
import { useStore } from "../../stores";
import { TabBox } from "../control";
import { Button } from "../buttons";

interface Order {
  id: number;
  type: "Limit" | "StopLoss";
  status: string;
  createdAt: number;
  inputToken: CoinPrimitive;
  outputToken: CoinPrimitive;
}

interface Request {
  id: string;
  registerId: string;
  txHash: string;
  target: string;
  msg: string;
  assets: string;
  status: string;
  createdAt: string;
  executedOrCancelledAt: string;
}

const OrderRow = ({ order }: { order: Order }) => {
  const {
    accountStore,
    chainStore,
    assetsStore: { nativeBalances, ibcBalances },
  } = useStore();
  const { chainId } = chainStore.osmosis;
  const { isMobile } = useWindowSize();
  const account = accountStore.getAccount(chainId);
  const allTokenBalances = nativeBalances.concat(ibcBalances);

  const inputCurrency = allTokenBalances.find(
    (tb) =>
      typeof order.inputToken.denom === "string" &&
      tb.balance.currency.coinMinimalDenom.toLowerCase() ===
        order.inputToken.denom.toLowerCase()
  )?.balance.currency;

  const outputCurrency = allTokenBalances.find(
    (tb) =>
      typeof order.outputToken.denom === "string" &&
      tb.balance.currency.coinMinimalDenom.toLowerCase() ===
        order.outputToken.denom.toLowerCase()
  )?.balance.currency;

  const handleCancelOrder = useCallback(async () => {
    try {
      await account.cosmwasm.sendExecuteContractMsg(
        "executeWasm",
        REGISTRY_ADDRESSES[chainId],
        { cancel_request: { id: order.id } },
        [],
        "",
        { gas: "350000" },
        undefined,
        (e) => console.log(e)
      );
    } catch (err) {
      console.log(err);
    }
  }, [order, chainId, account]);

  if (!inputCurrency || !outputCurrency) return null;

  const inputCoin = new CoinPretty(inputCurrency, order.inputToken.amount);
  const outputCoin = new CoinPretty(outputCurrency, order.outputToken.amount);

  return (
    <div
      key={order.id}
      className="w-full p-px rounded-2xl text-left bg-osmoverse-900 hover:bg-none mb-4"
    >
      <div className="flex flex-col place-content-between w-full h-full p-4 bg-card rounded-2xlinset cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 md:h-5 md:w-5 rounded-full overflow-hidden">
                {inputCurrency.coinImageUrl && (
                  <Image
                    src={inputCurrency.coinImageUrl}
                    alt="token icon"
                    className="rounded-full"
                    width={isMobile ? 20 : 32}
                    height={isMobile ? 20 : 32}
                  />
                )}
              </div>
              <h6 className="ml-1">{inputCurrency.coinDenom}</h6>
            </div>
            <div className="mx-3">{"->"}</div>
            <div className="flex items-center">
              <div className="w-8 h-8 md:h-5 md:w-5 rounded-full overflow-hidden">
                {outputCurrency.coinImageUrl && (
                  <Image
                    src={outputCurrency.coinImageUrl}
                    alt="token icon"
                    className="rounded-full"
                    width={isMobile ? 20 : 32}
                    height={isMobile ? 20 : 32}
                  />
                )}
              </div>
              <h6 className="ml-1">{outputCurrency.coinDenom}</h6>
            </div>
          </div>
          {order.status === "created" && (
            <Button
              color="error"
              className="button px-3 py-1 md:px-1 rounded-lg"
              disabled={account.txTypeInProgress !== ""}
              onClick={handleCancelOrder}
            >
              Cancel
            </Button>
          )}
        </div>
        <p className="font-bold mt-2">
          Sell {inputCoin.trim(true).toString()} for{" "}
          {outputCoin.trim(true).toString()}
        </p>
        <p className="subtitle2 md:caption text-wireframes-lightGrey">
          Created At:{" "}
          {dayjs(order.createdAt * 1000)
            .utc()
            .toString()}
        </p>
      </div>
    </div>
  );
};
const OrderRows = ({ orders }: { orders: Order[] }) => {
  return (
    <>
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </>
  );
};

export default function OrderHistory({
  orderType,
  containerClassName,
}: {
  orderType: "Limit" | "StopLoss";
  containerClassName?: string;
}) {
  const { chainStore, accountStore } = useStore();
  const { chainId, rpc } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const [orders, setOrders] = useState<Order[]>([]);

  const orderByStatus = (status: string) =>
    orders.filter(
      (order) => order.type === orderType && order.status === status
    );

  useEffect(() => {
    const fetchHistory = async () => {
      if (account) {
        const keplr = await account.getKeplr();
        if (!keplr) return;

        const {
          requests: { nodes },
        } = await request(
          SUBQUERY_ENDPOINTS[chainId],
          gql`
            query {
              requests(
                filter: {
                  registerId: {
                    like: "${account.bech32Address.toString()}"
                  }
                }
              ) {
                nodes {
                  id
                  registerId
                  target
                  msg
                  assets
                  status
                  createdAt
                  txHash
                  executedOrCancelledAt
                }
              }
            }
          `
        );

        const allOrders: Order[] = [];
        (nodes as Request[]).map((request) => {
          const msg = JSON.parse(Buffer.from(request.msg, "base64").toString());
          const { swap } = msg;
          if (!swap || !swap.first || !swap.route) return;
          allOrders.push({
            id: Number(request.id),
            type: swap.min_output === "0" ? "StopLoss" : "Limit",
            status: request.status,
            createdAt: Math.floor(new Date(request.createdAt).getTime() / 1000),
            inputToken: { denom: swap.first.denom_in, amount: swap.amount },
            outputToken: {
              denom:
                swap.route.length > 0
                  ? swap.route[swap.route.length - 1].denom_out
                  : swap.first.denom_out,
              amount:
                swap.min_output === "0" ? swap.max_output : swap.min_output,
            },
          });
        });
        setOrders(allOrders.sort((a, b) => b.id - a.id));
      }
    };

    const interval = setInterval(fetchHistory, 4000);
    return () => clearInterval(interval);
  }, [rpc, account, chainId]);

  return (
    <div
      className={classNames(
        "relative rounded-2xl bg-card border-2 md:border-0 bg-osmoverse-800 px-4 md:p-0 my-4 w-[27rem] md:mt-mobile-header ml-auto mr-[15%] lg:mx-auto",
        containerClassName
      )}
    >
      <TabBox
        tabs={[
          {
            title: "Open",
            content: <OrderRows orders={orderByStatus("created")} />,
          },
          {
            title: "Executed",
            content: <OrderRows orders={orderByStatus("executed")} />,
          },
          {
            title: "Cancelled",
            content: <OrderRows orders={orderByStatus("cancelled")} />,
          },
        ]}
      />
    </div>
  );
}
