import { CoinPretty, Dec } from "@osmosis-labs/unit";
import { waitFor } from "@testing-library/react";
import React from "react";

import { renderWithProviders } from "~/__tests__/test-utils";
import { AssetLists } from "~/config/generated/asset-lists";
import { trimPlaceholderZeros } from "~/utils/number";

import { CryptoFiatInput } from "../crypto-fiat-input";

const atomTxBody = {
  account_number: "376218",
  chain_id: "cosmoshub-4",
  fee: {
    gas: "188312",
    amount: [
      {
        amount: "5650",
        denom: "uatom",
      },
    ],
  },
  memo: "OsmosisFE",
  msgs: [
    {
      type: "cosmos-sdk/MsgTransfer",
      value: {
        receiver: "osmo17mlfltjtmpnysh7lmkmzyp6urcuw74mu25h3dk",
        sender: "cosmos17mlfltjtmpnysh7lmkmzyp6urcuw74muz0ypmy",
        source_channel: "channel-141",
        source_port: "transfer",
        timeout_height: {
          revision_height: "53012058",
          revision_number: "1",
        },
        token: {
          amount: "2171765",
          denom: "uatom",
        },
      },
    },
  ],
  sequence: "76",
  timeout_height: "29349013",
};

const testCases = [
  {
    name: "ATOM",
    chainName: "cosmoshub",
    symbol: "ATOM",
    feeDenom: atomTxBody.fee.amount[0].denom,
    feeAmount: atomTxBody.fee.amount[0].amount,
    balanceBaseAmount: atomTxBody.msgs[0].value.token.amount,
    chainPrettyName: "Cosmos Hub",
  },
  {
    name: "JUNO",
    chainName: "juno",
    symbol: "JUNO",
    feeDenom: "ujuno",
    feeAmount: "4200",
    balanceBaseAmount: "2500000",
    chainPrettyName: "Juno",
  },
];

describe.each(testCases)(
  "CryptoFiatInput max subtraction ($name)",
  ({
    chainName,
    symbol,
    feeDenom,
    feeAmount,
    balanceBaseAmount,
    chainPrettyName,
  }) => {
    it("subtracts the fee when denom maps to the same asset", async () => {
      const assetList = AssetLists.find(
        (list) => list.chain_name === chainName
      );
      const asset = assetList?.assets.find((listAsset) => {
        return listAsset.symbol === symbol;
      });

      expect(asset).toBeDefined();

      const currency = {
        coinDecimals: asset!.decimals,
        coinDenom: asset!.symbol,
        coinMinimalDenom: asset!.coinMinimalDenom,
      };

      const balanceCoin = new CoinPretty(currency, balanceBaseAmount);
      const transferGasCost = new CoinPretty(
        {
          coinDecimals: asset!.decimals,
          coinDenom: asset!.symbol,
          coinMinimalDenom: feeDenom,
        },
        feeAmount
      );

      const expectedMax = balanceCoin
        .toDec()
        .sub(transferGasCost.toDec().mul(new Dec("1.1")));
      const expectedValue = trimPlaceholderZeros(expectedMax.toString());

      const onChangeCryptoInput = jest.fn();

      renderWithProviders(
        <CryptoFiatInput
          currentUnit="crypto"
          setCurrentUnit={jest.fn()}
          isMax
          setIsMax={jest.fn()}
          transferGasCost={transferGasCost}
          transferGasChain={{ prettyName: chainPrettyName }}
          assetPrice={undefined}
          assetWithBalance={{
            denom: asset!.symbol,
            address: asset!.coinMinimalDenom,
            decimals: asset!.decimals,
            amount: balanceCoin,
          }}
          cryptoInput={balanceCoin.toDec().toString()}
          onChangeCryptoInput={onChangeCryptoInput}
          fiatInput=""
          onChangeFiatInput={jest.fn()}
          isInsufficientBal={false}
          isInsufficientFee={false}
        />
      );

      await waitFor(() => {
        expect(onChangeCryptoInput).toHaveBeenCalledWith(expectedValue);
      });
    });
  }
);
