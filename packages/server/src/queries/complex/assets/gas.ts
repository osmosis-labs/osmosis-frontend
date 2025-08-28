import { Chain } from "@osmosis-labs/types";
import { DefaultGasPriceStep } from "@osmosis-labs/utils";

import { queryFeesBaseGasPrice } from "../../osmosis/txfees";

export async function getFeeTokenGasPriceStep({
  chainId,
  chainList,
}: {
  chainId: string;
  chainList: Chain[];
}) {
  const osmosisChainId = chainList[0].chain_id;

  if (chainId === osmosisChainId) {
    const result = await queryFeesBaseGasPrice({
      chainList,
    });
    const osmosisGasPrice = Number(result.base_fee);

    return {
      low: osmosisGasPrice,
      average: osmosisGasPrice * 1.5,
      high: osmosisGasPrice * 2.5,
    };
  }

  const counterpartyChain = chainList.find(
    ({ chain_id }) => chain_id === chainId
  );

  if (!counterpartyChain)
    throw new Error(`Chain (${chainId}) not found in chain list`);

  const feeCurrency = counterpartyChain.feeCurrencies[0];

  return {
    low: feeCurrency?.gasPriceStep?.low ?? DefaultGasPriceStep.low,
    average: feeCurrency?.gasPriceStep?.average ?? DefaultGasPriceStep.average,
    high: feeCurrency?.gasPriceStep?.high ?? DefaultGasPriceStep.high,
  };
}
