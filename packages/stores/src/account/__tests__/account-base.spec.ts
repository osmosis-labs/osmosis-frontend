import { DefaultGasPriceStep } from "@osmosis-labs/keplr-hooks";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockChainList, TestOsmosisChainId } from "../../tests/mock-data";
import { server } from "../../tests/msw-server";
import { RootStore } from "../../tests/test-env";

let rootStore: RootStore;
let accountStore: RootStore["accountStore"];

beforeEach(() => {
  rootStore = new RootStore();
  accountStore = rootStore.accountStore;
});

describe("getGasAmount", () => {
  it("should return the correct gas amount when chain has fee token values", async () => {
    const gasLimit = 1000;
    const chainId = "cosmoshub-4";

    const gasAmount = await accountStore.getGasAmount(
      gasLimit.toString(),
      chainId
    );

    const expectedGasAmount =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      MockChainList.find(({ chain_id }) => chain_id === chainId)!.fees
        .fee_tokens[0].average_gas_price! * gasLimit;

    expect(gasAmount.amount).toBe(expectedGasAmount.toString());
    expect(gasAmount.denom).toBe("uatom");
  });

  it("should return the correct gas amount according to current osmosis fee gas price", async () => {
    const gasLimit = 1000;
    const baseFee = 0.055;
    const chainId = TestOsmosisChainId;
    const multiplier = 2;

    server.use(
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/cur_eip_base_fee",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_fee: baseFee.toString(),
            } as {
              base_fee: string;
            })
          );
        }
      )
    );

    const gasAmount = await accountStore.getGasAmount(
      gasLimit.toString(),
      chainId
    );

    expect(gasAmount.amount).toBe(
      Math.ceil(baseFee * multiplier * gasLimit).toString()
    );
    expect(gasAmount.denom).toBe("uosmo");
  });

  it("should use the default osmosis gas price if query fails", async () => {
    const gasLimit = 1000;
    const chainId = TestOsmosisChainId;

    server.use(
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/cur_eip_base_fee",
        (_req, res, ctx) => {
          return res(ctx.status(500));
        }
      )
    );

    const gasAmount = await accountStore.getGasAmount(
      gasLimit.toString(),
      chainId
    );

    const expectedGasAmount =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      MockChainList[0].fees.fee_tokens[0].average_gas_price! * gasLimit;
    expect(gasAmount.amount).toBe(expectedGasAmount.toString());
    expect(gasAmount.denom).toBe("uosmo");
  });

  it("should use default gas price step when chain does not have gas values", async () => {
    const gasLimit = 1000;
    const chainId = "cosmoshub-4-no-gas-price";

    const gasAmount = await accountStore.getGasAmount(
      gasLimit.toString(),
      chainId
    );

    expect(gasAmount.amount).toBe(
      (DefaultGasPriceStep.average * gasLimit).toString()
    );
    expect(gasAmount.denom).toBe("uatom");
  });

  it("should throw an error if the chain is not found", async () => {
    const gasLimit = "1000";
    const chainId = "unknown-chain";

    await expect(accountStore.getGasAmount(gasLimit, chainId)).rejects.toThrow(
      `Chain (${chainId}) not found`
    );
  });
});
