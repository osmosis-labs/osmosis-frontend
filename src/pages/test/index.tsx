import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

export const TestPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  return (
    <div>
      <div>{`Account: ${accountInfo.bech32Address}`}</div>
      <div>Balances</div>
      {queries.queryBalances
        .getQueryBech32Address(accountInfo.bech32Address)
        .balances.map(bal => {
          return (
            <div key={bal.currency.coinMinimalDenom}>
              {bal.balance.toString()}
            </div>
          );
        })}
      <div>Pools</div>
      {queries.osmosis.queryGammPools.pools.map(pool => {
        return (
          <React.Fragment key={pool.id}>
            <div>Id</div>
            <div>{pool.id}</div>
            <div>Swap Fee</div>
            <div>{`${pool.swapFee.toString()}%`}</div>
            <div>Pool Assets</div>
            {pool.poolAssets.map(asset => {
              return (
                <div
                  key={asset.amount.denom}
                >{`Weight: ${asset.weight.toString()}, Asset: ${asset.amount.toString()}`}</div>
              );
            })}
          </React.Fragment>
        );
      })}
      {JSON.stringify(queries.osmosis.queryGammPools.response)}
      <br />
      <button
        onClick={e => {
          e.preventDefault();

          accountInfo.init();
        }}
      >
        Init
      </button>
      <button
        onClick={async e => {
          e.preventDefault();

          await accountInfo.osmosis.sendCreatePoolMsg(
            "0.5",
            [
              {
                weight: "100",
                token: {
                  currency: {
                    coinDenom: "OSMO",
                    coinMinimalDenom: "uosmo",
                    coinDecimals: 6
                  },
                  amount: "1000"
                }
              },
              {
                weight: "200",
                token: {
                  currency: {
                    coinDenom: "ATOM",
                    coinMinimalDenom: "uatom",
                    coinDecimals: 6
                  },
                  amount: "1000"
                }
              },
              {
                weight: "100",
                token: {
                  currency: {
                    coinDenom: "FOO",
                    coinMinimalDenom: "ufoo",
                    coinDecimals: 6
                  },
                  amount: "1000"
                }
              }
            ],
            undefined,
            tx => {
              console.log(tx);
            }
          );
        }}
      >
        Create Pool
      </button>
    </div>
  );
});
