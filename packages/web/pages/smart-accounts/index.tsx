import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { isNil } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import type { GetServerSideProps, NextPage } from "next";
import { FunctionComponent } from "react";

import { Button } from "~/components/buttons";
import { OsmoverseCard } from "~/components/cards/osmoverse-card";
import { CheckBox } from "~/components/control";
import { Spinner } from "~/components/loaders";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useAddAuthenticator } from "~/hooks/mutations/osmosis/add-authenticator";
import { useRemoveAuthenticator } from "~/hooks/mutations/osmosis/remove-authenticator";
import { useStore } from "~/stores";
import { api, RouterOutputs } from "~/utils/trpc";

export const getServerSideProps: GetServerSideProps = async () => {
  if (process.env.NODE_ENV !== "development") {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
      props: {},
    };
  }

  return { props: {} };
};

const SmartAccounts: NextPage = observer(function () {
  const { chainStore, accountStore } = useStore();
  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Pools.pageViewed],
  });
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);

  const osmosisAddress = account?.address ?? "";

  const { data: authenticators, refetch: refetchAuthenticators } =
    api.edge.authenticators.getAuthenticators.useQuery(
      {
        userOsmoAddress: osmosisAddress,
      },
      {
        enabled: osmosisAddress.length > 0,
      }
    );

  const { data: cosmosAccount } =
    api.edge.authenticators.getCosmosAccount.useQuery(
      {
        address: osmosisAddress,
      },
      {
        enabled: osmosisAddress.length > 0,
      }
    );

  const removeAuthenticator = useRemoveAuthenticator({
    queryOptions: {
      onSuccess: () => {
        refetchAuthenticators();
      },
    },
  });

  const addAuthenticator = useAddAuthenticator({
    queryOptions: {
      onSuccess: () => {
        refetchAuthenticators();
      },
    },
  });

  const onCreateFirstAuthenticator = async (e: any) => {
    if (!cosmosAccount) {
      throw new Error("Cosmos account not found");
    }

    e.preventDefault();

    const accountPubKey = cosmosAccount.account.pub_key.key;

    addAuthenticator.mutate({
      type: "SignatureVerificationAuthenticator",
      data: fromBase64(accountPubKey),
    });
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();

    const key = PrivKeySecp256k1.generateRandomKey();
    const allowedMessages = [
      "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
    ];
    const allowedAmount = "20000";
    const period = "day";

    const authenticator = {
      authenticator_type: "SignatureVerificationAuthenticator",
      data: toBase64(key.getPubKey().toBytes()),
    };

    const spendlimit = {
      authenticator_type: "SpendLimitAuthenticator",
      data: toBase64(
        Buffer.from(`{"allowed": ${allowedAmount}, "period": "${period}"}`)
      ),
    };

    const messagefilter = {
      authenticator_type: "MessageFilterAuthenticator",
      data: toBase64(
        Buffer.from(`{"type":"${allowedMessages[0]}","value":{}}`)
      ),
    };

    const compositeAuthData = [authenticator, spendlimit, messagefilter];

    addAuthenticator.mutate(
      {
        type: "AllOfAuthenticator",
        data: Buffer.from(JSON.stringify(compositeAuthData)).toJSON().data,
      },
      {
        onSuccess: () => {
          accountStore.setOneClickTradingInfo({
            allowed: allowedAmount,
            allowedMessages: allowedMessages,
            period,
            privateKey: toBase64(key.toBytes()),
          });

          accountStore.setUseOneClickTrading({ nextValue: true });
        },
      }
    );
  };

  return (
    <main className="m-auto max-w-container bg-osmoverse-900 px-8 md:px-3">
      <div className="grid h-full w-full gap-7 rounded-[27px] bg-osmoverse-800 px-9 py-7 transition-colors">
        <div>
          <div>
            <div>
              <h5 className="gap-1 text-white-mid">Authenticator Options</h5>
            </div>
            <div className="flex place-content-between items-center gap-7 px-9 py-7">
              {authenticators && cosmosAccount && authenticators.length < 1 && (
                <form onSubmit={onCreateFirstAuthenticator}>
                  <Button type="submit" disabled={authenticators.length > 1}>
                    {removeAuthenticator.isLoading || addAuthenticator.isLoading
                      ? "Submitting..."
                      : "Create First Authenticator"}
                  </Button>
                </form>
              )}
              <form onSubmit={onSubmit}>
                <Button
                  type="submit"
                  disabled={
                    removeAuthenticator.isLoading || addAuthenticator.isLoading
                  }
                >
                  {removeAuthenticator.isLoading || addAuthenticator.isLoading
                    ? "Submitting..."
                    : "Create One Click Trading Account"}
                </Button>
              </form>
              <CheckBox
                className="transition-all after:!h-6 after:!w-6 after:!rounded-[10px] after:!border-2 after:!border-superfluid after:!bg-transparent checked:after:border-none checked:after:bg-superfluid"
                isOn={
                  accountStore.useOneClickTrading &&
                  !isNil(accountStore.oneClickTradingInfo)
                }
                onToggle={() => {
                  accountStore.setUseOneClickTrading({
                    nextValue: !accountStore.useOneClickTrading,
                  });
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
            {(removeAuthenticator.isLoading || addAuthenticator.isLoading) && (
              <Spinner></Spinner>
            )}
            <div className="flex flex-col gap-3">
              {authenticators?.map((authenticator, index) => (
                <div key={index} className="">
                  <AuthenticatorCard
                    authenticator={authenticator}
                    onRemoveAuthenticator={(id: string) => {
                      removeAuthenticator.mutate({ id });
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        </div>
      </div>
    </main>
  );
});

const AuthenticatorCard: FunctionComponent<{
  authenticator: RouterOutputs["edge"]["authenticators"]["getAuthenticators"][number];
  onRemoveAuthenticator: (id: string) => void;
}> = ({ authenticator, onRemoveAuthenticator }) => {
  if (authenticator.type === "SignatureVerificationAuthenticator") {
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
                onClick={() => onRemoveAuthenticator(authenticator.id)}
              >
                Remove Authenticator
              </Button>
            </div>
          </div>
        </OsmoverseCard>
      </div>
    );
  }

  if (
    authenticator.type === "AnyOfAuthenticator" ||
    authenticator.type === "AllOfAuthenticator"
  ) {
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
              <div className="flex flex-col gap-2 ">
                {authenticator.subAuthenticators?.map(
                  (subAuthenticator, index) => (
                    <span
                      className="w-auto rounded-lg border border-osmoverse-200"
                      key={index}
                    >
                      <SubAuthenticator subAuthenticator={subAuthenticator} />
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="flex place-content-between items-center gap-3 px-3 py-3">
              <span className="subtitle1 whitespace-wrap text-white-disabled">
                Remove
              </span>
              <Button
                className="w-auto"
                onClick={() => onRemoveAuthenticator(authenticator.id)}
              >
                Remove Authenticator
              </Button>
            </div>
          </div>
        </OsmoverseCard>
      </div>
    );
  }

  if (
    authenticator.type === "SpendLimitAuthenticator" ||
    authenticator.type === "MessageFilterAuthenticator"
  ) {
    return (
      <div key={authenticator.id} className="flex flex-col gap-3">
        <span className="subtitle1 whitespace-wrap text-white-disabled">
          {authenticator.id}
        </span>
        <Button onClick={() => onRemoveAuthenticator(authenticator.id)}>
          Remove Authenticator
        </Button>
        <h6 className="mt-0.5 text-white-high">{authenticator.type}</h6>
        <h6 className="mt-0.5 text-white-high">{authenticator.data}</h6>
      </div>
    );
  }

  return null;
};

type SubAuthenticatorType = NonNullable<
  RouterOutputs["edge"]["authenticators"]["getAuthenticators"][number]["subAuthenticators"]
>[number];

const SubAuthenticator: FunctionComponent<{
  subAuthenticator: SubAuthenticatorType;
}> = ({ subAuthenticator }) => {
  if (
    subAuthenticator.authenticator_type === "SignatureVerificationAuthenticator"
  ) {
    return (
      <div>
        <div className="flex place-content-between items-center gap-3 px-3 py-3">
          <span className="subtitle1 whitespace-wrap text-white-disabled">
            Type
          </span>
          <span className="">{subAuthenticator.authenticator_type}</span>
        </div>
        <div className="flex place-content-between items-center gap-3 px-3 py-3">
          <span className="subtitle1 whitespace-wrap text-white-disabled">
            Public Key
          </span>
          <span className="">{subAuthenticator.data}</span>
        </div>
      </div>
    );
  }

  if (
    subAuthenticator.authenticator_type === "AnyOfAuthenticator" ||
    subAuthenticator.authenticator_type === "AllOfAuthenticator"
  ) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <h6 className="mt-0.5 text-white-high">
            {subAuthenticator.authenticator_type}
          </h6>
          <h6 className="mt-0.5 text-white-high">
            <SubAuthenticator
              subAuthenticator={
                JSON.parse(
                  Buffer.from(subAuthenticator.data, "base64").toString()
                ) as SubAuthenticatorType
              }
            />
          </h6>
        </div>
      </div>
    );
  }

  if (
    subAuthenticator.authenticator_type === "SpendLimitAuthenticator" ||
    subAuthenticator.authenticator_type === "MessageFilterAuthenticator"
  ) {
    return (
      <div>
        <div className="flex place-content-between items-center gap-3 px-3 py-3">
          <span className="subtitle1 whitespace-wrap text-white-disabled">
            Type
          </span>
          <span className="">{subAuthenticator.authenticator_type}</span>
        </div>
        <div className="flex place-content-between items-center gap-3 px-3 py-3">
          <span className="subtitle1 whitespace-wrap text-white-disabled">
            Data
          </span>
          <span className="">
            {Buffer.from(subAuthenticator.data, "base64").toString()}
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default SmartAccounts;
