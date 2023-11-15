import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { useEffect, useState } from "react";

import { Button } from "~/components/buttons";
import { OsmoverseCard } from "~/components/cards/osmoverse-card";
import { CheckBox } from "~/components/control";
import Spinner from "~/components/spinner";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useStore } from "~/stores";
// query rest
import { apiClient } from "~/utils/api-client";

import { ChainInfos } from "../../config/generated/chain-infos";

export async function queryAuthenticators(address: string): Promise<any> {
  return await apiClient<any>(
    ChainInfos[0].rest + `osmosis/authenticator/authenticators/${address}`
  );
}

export async function queryAccount(address: string): Promise<any> {
  return await apiClient<any>(
    ChainInfos[0].rest + `cosmos/auth/v1beta1/accounts/${address}`
  );
}

const SmartAccounts: NextPage = observer(function () {
  const { chainStore, accountStore } = useStore();
  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Pools.pageViewed],
  });
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);

  const [authenticatorsData, setAuthenticatorsData] = useState([]);
  const [accountPubKey, setAccountPubkey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  var [isOneClickTradingEnabled, setIsOneClickTradingEnabled] = useState(false);

  const createFirstAuth = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    let authenticator = {
      type: "SignatureVerificationAuthenticator",
      data: fromBase64(accountPubKey),
    };

    if (account?.osmosis) {
      account.osmosis
        .sendAddAuthenticatorMsg(authenticator, "", (tx: any) => {
          if (tx.code === 0) {
            const fetchAuthenticators = async () => {
              const data = await queryAuthenticators(account?.address ?? "");
              setAuthenticatorsData(data.account_authenticators);
              console.log(data.account_authenticators);
            };

            fetchAuthenticators();
            //logEvent([EventName.Stake.collectAndReinvestCompleted]);
          } else {
            alert("fail");
          }
        })
        .catch(console.error);
    }

    setIsSubmitting(false);
  };

  // Function to handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    let key = PrivKeySecp256k1.generateRandomKey();
    localStorage.setItem("SessionKey", toBase64(key.toBytes()));

    let authenticator = {
      authenticator_type: "SignatureVerificationAuthenticator",
      data: toBase64(key.getPubKey().toBytes()),
    };

    let spendlimit = {
      authenticator_type: "SpendLimitAuthenticator",
      data: toBase64(Buffer.from('{"allowed": 20000, "period": "day"}')),
    };

    let messagefilter = {
      authenticator_type: "MessageFilterAuthenticator",
      data: toBase64(
        Buffer.from(
          '{"type":"/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn","value":{}}'
        )
      ),
    };

    let compositeAuthData = [authenticator, spendlimit, messagefilter];

    let allOfAuthenticator = {
      type: "AllOfAuthenticator",
      data: Buffer.from(JSON.stringify(compositeAuthData)).toJSON().data,
    };

    console.log(allOfAuthenticator);

    if (account?.osmosis) {
      account.osmosis
        .sendAddAuthenticatorMsg(allOfAuthenticator, "", (tx: any) => {
          if (tx.code === 0) {
            const fetchAuthenticators = async () => {
              const data = await queryAuthenticators(account?.address ?? "");
              setAuthenticatorsData(data.account_authenticators);
              console.log(data.account_authenticators);
            };

            fetchAuthenticators();
            //logEvent([EventName.Stake.collectAndReinvestCompleted]);
          } else {
            alert("fail");
          }
        })
        .catch(console.error);
    }

    console.log(key.getPubKey().toString());

    setIsSubmitting(false);
  };

  const handleRemoveAuthenticator = async (id: any) => {
    setIsSubmitting(true);

    if (account?.osmosis) {
      account.osmosis
        .sendRemoveAuthenticatorMsg(id, "", (tx: any) => {
          if (tx.code === 0) {
            const fetchAuthenticators = async () => {
              const data = await queryAuthenticators(account?.address ?? "");
              setAuthenticatorsData(data.account_authenticators);
              console.log(data.account_authenticators);
            };

            fetchAuthenticators();
            //logEvent([EventName.Stake.collectAndReinvestCompleted]);
          } else {
            alert("fail");
          }
        })
        .catch(console.error);
    }

    setIsSubmitting(false);
  };

  const setOneClickTrading: any = async (isOneClickTradingEnabled: boolean) => {
    isOneClickTradingEnabled = !isOneClickTradingEnabled;
    localStorage.setItem(
      "isOneClickTradingEnabled",
      isOneClickTradingEnabled.toString()
    );

    setIsOneClickTradingEnabled(isOneClickTradingEnabled);
  };

  useEffect(() => {
    setIsSubmitting(true);
    const localStorageIsOneClickEnabled =
      localStorage.getItem("isOneClickTradingEnabled") === "true";
    setIsOneClickTradingEnabled(localStorageIsOneClickEnabled);

    //handleRemoveAuthenticator(36);

    const fetchAuthenticators = async () => {
      const data = await queryAuthenticators(account?.address ?? "");
      setAuthenticatorsData(data.account_authenticators);
      const pubkey = await queryAccount(account?.address ?? "");
      setAccountPubkey(pubkey.account.pub_key.key);
      console.log(data.account_authenticators);
      console.log(pubkey.account.pub_key.key);
    };

    fetchAuthenticators();
    setIsSubmitting(false);
  }, [account?.address]);

  const renderAuthenticator: any = (authenticator: any) => {
    switch (authenticator.type) {
      case "SignatureVerificationAuthenticator":
        return (
          <div>
            <OsmoverseCard>
              <div key={authenticator.id}>
                <div className="flex place-content-between items-center gap-3 px-3 py-3">
                  <span className="subtitle1 whitespace-wrap text-white-disabled">
                    ID
                  </span>
                  <span className="">{authenticator.id}</span>
                </div>
                <div className="flex place-content-between items-center gap-3 px-3 py-3">
                  <span className="subtitle1 whitespace-wrap text-white-disabled">
                    Type
                  </span>
                  <span className="">{authenticator.type}</span>
                </div>
                <div className="flex place-content-between items-center gap-3 px-3 py-3">
                  <span className="subtitle1 whitespace-wrap text-white-disabled">
                    Public Key
                  </span>
                  <span className="">{authenticator.data}</span>
                </div>
                <div className="flex place-content-between items-center gap-3 px-3 py-3">
                  <span className="subtitle1 whitespace-wrap text-white-disabled">
                    Remove
                  </span>
                  <Button
                    className="w-auto"
                    onClick={() => handleRemoveAuthenticator(authenticator.id)}
                  >
                    Remove Authenticator
                  </Button>
                </div>
              </div>
            </OsmoverseCard>
          </div>
        );
      case "AnyOfAuthenticator":
      case "AllOfAuthenticator":
        return (
          <div>
            <OsmoverseCard>
              <div key={authenticator.id}>
                <div className="flex place-content-between items-center gap-3 px-3 py-3">
                  <span className="subtitle1 whitespace-wrap text-white-disabled">
                    ID
                  </span>
                  <span className="">{authenticator.id}</span>
                </div>
                <div className="flex place-content-between items-center gap-3 px-3 py-3">
                  <span className="subtitle1 whitespace-wrap text-white-disabled">
                    Type
                  </span>
                  <span className="">{authenticator.type}</span>
                </div>
                <div className="flex place-content-between items-center gap-3 px-3 py-3">
                  <span className="subtitle1 whitespace-wrap text-white-disabled">
                    Sub Authenticators
                  </span>
                  <span className="w-auto">
                    {renderSubAuthenticator(atob(authenticator.data))}
                  </span>
                </div>
                <div className="flex place-content-between items-center gap-3 px-3 py-3">
                  <span className="subtitle1 whitespace-wrap text-white-disabled">
                    Remove
                  </span>
                  <Button
                    className="w-auto"
                    onClick={() => handleRemoveAuthenticator(authenticator.id)}
                  >
                    Remove Authenticator
                  </Button>
                </div>
              </div>
            </OsmoverseCard>
          </div>
        );
      case "SpendLimitAuthenticator":
      case "MessageFilterAuthenticator":
        return (
          <div key={authenticator.id} className="flex flex-col gap-3">
            <span className="subtitle1 whitespace-wrap text-white-disabled">
              {authenticator.id}
            </span>
            <Button onClick={() => handleRemoveAuthenticator(authenticator.id)}>
              Remove Authenticator
            </Button>
            <h6 className="mt-0.5 text-white-high">{authenticator.type}</h6>
            <h6 className="mt-0.5 text-white-high">{authenticator.data}</h6>
          </div>
        );
      default:
        return "foo";
    }
  };

  const renderSubAuthenticator: any = (authenticators: any) => {
    var parsedAuths = JSON.parse(authenticators);
    return parsedAuths.map((authenticator: any) => {
      switch (authenticator.authenticator_type) {
        case "SignatureVerificationAuthenticator":
          return (
            <div>
              <div className="flex place-content-between items-center gap-3 px-3 py-3">
                <span className="subtitle1 whitespace-wrap text-white-disabled">
                  Type
                </span>
                <span className="">{authenticator.authenticator_type}</span>
              </div>
              <div className="flex place-content-between items-center gap-3 px-3 py-3">
                <span className="subtitle1 whitespace-wrap text-white-disabled">
                  Public Key
                </span>
                <span className="">{authenticator.data}</span>
              </div>
            </div>
          );
        case "AnyOfAuthenticator":
        case "AllOfAuthenticator":
          return (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                <h6 className="mt-0.5 text-white-high">
                  {authenticator.authenticator_type}
                </h6>
                <h6 className="mt-0.5 text-white-high">
                  {renderSubAuthenticator(atob(authenticator.data))}
                </h6>
              </div>
            </div>
          );
        case "SpendLimitAuthenticator":
        case "MessageFilterAuthenticator":
          return (
            <div>
              <div className="flex place-content-between items-center gap-3 px-3 py-3">
                <span className="subtitle1 whitespace-wrap text-white-disabled">
                  Type
                </span>
                <span className="">{authenticator.authenticator_type}</span>
              </div>
              <div className="flex place-content-between items-center gap-3 px-3 py-3">
                <span className="subtitle1 whitespace-wrap text-white-disabled">
                  Data
                </span>
                <span className="">{atob(authenticator.data)}</span>
              </div>
            </div>
          );
        default:
          return "foo";
      }
    });
  };

  return (
    <main className="m-auto max-w-container bg-osmoverse-900 px-8 md:px-3">
      <div className="flex grid h-full w-full gap-7 rounded-[27px] bg-osmoverse-800 px-9 py-7 transition-colors">
        <div>
          <div>
            <div>
              <h5 className="gap-1 text-white-mid">Authenticator Options</h5>
            </div>
            <div className="flex place-content-between items-center gap-7 px-9 py-7">
              {authenticatorsData.length < 1 && (
                <form onSubmit={createFirstAuth}>
                  <Button
                    type="submit"
                    disabled={authenticatorsData.length > 1}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : "Create First Authenticator"}
                  </Button>
                </form>
              )}
              <form onSubmit={handleSubmit}>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Submitting..."
                    : "Create One Click Trading Account"}
                </Button>
              </form>
              <CheckBox
                className="transition-all after:!h-6 after:!w-6 after:!rounded-[10px] after:!border-2 after:!border-superfluid after:!bg-transparent checked:after:border-none checked:after:bg-superfluid"
                isOn={isOneClickTradingEnabled}
                onToggle={() => {
                  setOneClickTrading(isOneClickTradingEnabled);
                }}
              >
                One Click Trading Enabled
              </CheckBox>
            </div>
          </div>
        </div>
        <div>
          <div>
            <h5 className="gap-5 text-white-mid">Authenticators</h5>
          </div>
          <>
            {isSubmitting && <Spinner></Spinner>}
            {authenticatorsData.map((authenticator: any, index: any) => (
              <div key={index} className="">
                <>{renderAuthenticator(authenticator)}</>
              </div>
            ))}
          </>
        </div>
      </div>
    </main>
  );
});

export default SmartAccounts;
