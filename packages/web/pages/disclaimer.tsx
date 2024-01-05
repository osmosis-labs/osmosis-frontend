import type { NextPage } from "next";
import { NextSeo } from "next-seo";

import { useFeatureFlags, useTranslation } from "~/hooks";

const Disclaimer: NextPage = () => {
  const { t } = useTranslation();
  const flags = useFeatureFlags();
  return (
    <section className="bg-osmoverse-900 pt-20">
      <NextSeo
        title={t("seo.disclaimer.title")}
        description={t("seo.disclaimer.description")}
      />
      <div className="mx-auto max-w-container overflow-y-auto p-5 md:h-full">
        <div className="text-center">
          <span>Osmosis Disclaimer</span>
        </div>
        <div className="md:caption my-5 mx-auto max-w-lg rounded-xl bg-osmoverse-700 p-4 text-xs text-white-mid">
          Osmosis is a decentralized peer-to-peer blockchain that people can use
          to create liquidity and trade IBC enabled tokens. The Osmosis
          blockchain is made up of free, public, and open-source software. Your
          use of Osmosis involves various risks, including, but not limited, to
          losses while digital assets are being supplied to Osmosis pools and
          losses due to the fluctuation of prices of tokens in a trading pair or
          liquidity pool, including Impermanent Loss. Before using any pool on
          the Osmosis blockchain, you should review the relevant documentation
          to make sure you understand how Osmosis works, and the pool you use on
          Osmosis works. Additionally, just as you can access email protocols,
          such as SMTP, through multiple email clients, you can access pools on
          Osmosis through several web or mobile interfaces. You are responsible
          for doing your own diligence on those interfaces to understand the
          fees and risks they present.
          <br />
          <br />
          AS DESCRIBED IN THE OSMOSIS LICENSES, THE OSMOSIS PROTOCOL IS PROVIDED
          “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.
          Although Osmosis Labs Pte. Ltd. ( “Osmosis Labs” ) developed much of
          the initial code for the Osmosis protocol, it does not provide, own,
          or control the Osmosis protocol, which is run by a decentralized
          validator set. Upgrades and modifications to the protocol are managed
          in a community-driven way by holders of the OSMO governance token. No
          developer or entity involved in creating the Osmosis protocol will be
          liable for any claims or damages whatsoever associated with your use,
          inability to use, or your interaction with other users of the Osmosis
          protocol, including any direct, indirect, incidental, special,
          exemplary, punitive or consequential damages, or loss of profits,
          cryptocurrencies, tokens, or anything else of value.
        </div>
      </div>
      <div className="mx-auto max-w-container overflow-y-auto p-5 md:h-full">
        <div className="text-center">
          <span>Osmosis Privacy Policy</span>
        </div>
        <div className="md:caption my-5 mx-auto max-w-lg rounded-xl bg-osmoverse-700 p-4 text-xs text-white-mid">
          By using this app you consent to anonymous usage analytics data being
          collected to improve the overall user experience.
        </div>
      </div>
      <div className="mx-auto max-w-container overflow-y-auto p-5 md:h-full">
        <div className="text-center">
          <span>Osmosis Rektdrop Disclaimer</span>
        </div>
        <div className="md:caption my-5 mx-auto max-w-lg rounded-xl bg-osmoverse-700 p-4 text-xs text-white-mid">
          On June 7, 2022, a software bug related to Osmosis liquidity pool led
          to an incorrect, excessive amount of LP shares to be distributed.
          While under no obligation to do so, Osmosis Foundation has decided to
          take certain steps to compensate those affected by the exploit. On
          June 28, 2022, Osmosis will distribute tokens in-kind to losses to
          affected wallet addresses. Liquidity providers of affected pools will
          receive tokens (or OSMO for non-liquid assets) sent to their account
          equivalent to the amount affected by the bug. In consideration for
          this payment, you agree to waive, release, covenant not to sue and
          forever discharge Osmosis Foundation Ltd., its vendors, affiliates and
          licensees, and their respective owners, corporate parents,
          subsidiaries, affiliates, licensees and the officers, shareholders,
          directors, employees, agents, representatives, successors and assigns
          of each of these (collectively, “Releasees”) from any and all claims,
          demands, causes of action, liabilities, losses, injuries, damages,
          costs, and expenses (including, without limitation, reasonable
          attorneys’ fees) whatsoever that relate to, arise out of, or are in
          any way connected to (i) the loss of funds, or (ii) the services
          provided to you by the Releases, whether or not any such Claims may be
          based on or arise out of the negligent acts or omissions of any of the
          Releasees or otherwise. If you do not accept the terms outlined above
          and/or do not wish to accept the distributed funds, please contact
          inquiry@osmosis.team and an Osmosis team member will help you return
          the funds.
        </div>
      </div>
      {flags.multiBridgeProviders && (
        <div
          className="mx-auto max-w-container overflow-y-auto p-5 md:h-full"
          id="providers-and-bridge-disclaimer"
        >
          <div className="text-center">
            <span>Third-Party Providers and Bridges Disclaimer</span>
          </div>
          <div className="md:caption my-5 mx-auto flex max-w-lg flex-col gap-2 rounded-xl bg-osmoverse-700 p-4 text-xs text-white-mid">
            <p>
              By using third-party providers, including bridges, within the
              Osmosis ecosystem, you acknowledge and accept the inherent risks
              associated with blockchain-based systems. These risks include, but
              are not limited to, the potential loss of digital assets during
              transfers, the volatility of cryptocurrency prices, and the
              possibility of technical failures or errors in third-party
              services.
            </p>
            <p>
              All services provided by these third-party entities are offered on
              an "as is" and "as available" basis. Osmosis Labs expressly
              disclaims all warranties, whether express or implied, including
              the warranties of merchantability, fitness for a particular
              purpose, and non-infringement. Osmosis Labs does not guarantee
              continuous, uninterrupted, error-free, or secure operation of any
              part of these third-party services.
            </p>
            <p>
              Osmosis Labs Pte. Ltd. ("Osmosis Labs"), along with its affiliates
              and respective officers, directors, agents, employees, and
              representatives, will not be liable for any types of damages
              arising out of or in connection with your use of third-party
              providers and bridges. These damages include direct, indirect,
              incidental, special, punitive, or consequential damages.
            </p>
            <p>
              You bear sole responsibility for the security of your private keys
              and the accuracy of your transaction details. Osmosis Labs urges
              you to exercise caution and conduct thorough due diligence before
              engaging with any third-party service. Loss or exposure of your
              private keys to unauthorized parties may result in the
              irreversible loss of your digital assets.
            </p>{" "}
            <p>
              Please be aware that transactions conducted through these
              third-party services are typically irreversible. Once a
              transaction is executed, it cannot be undone, and losses due to
              fraudulent, accidental, or incorrect transactions may be permanent
              and non-recoverable.
            </p>{" "}
            <p>
              The mention of any third-party provider or bridge by Osmosis Labs
              does not imply its endorsement or recommendation. Osmosis Labs is
              not responsible for the practices or content of these third-party
              services.
            </p>{" "}
            <p>
              The terms of this disclaimer may be amended at any time, and your
              continued use of third-party services following any such changes
              constitutes your consent to such changes. It is your
              responsibility to review this disclaimer periodically.
            </p>{" "}
            <p>
              For any inquiries or concerns regarding this disclaimer or
              third-party services, please contact Osmosis Labs at the{" "}
              <a
                href="https://support.osmosis.zone/"
                target="_blank"
                className="text-wosmongton-100"
              >
                Support Lab
              </a>
              . By using third-party providers and bridges within the Osmosis
              ecosystem, you signify that you have read, understood, and agreed
              to the terms outlined in this disclaimer.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Disclaimer;
