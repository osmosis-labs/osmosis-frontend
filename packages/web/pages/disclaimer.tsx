import type { NextPage } from "next";
import { NextSeo } from "next-seo";

import { useTranslation } from "~/hooks";

const Disclaimer: NextPage = () => {
  const { t } = useTranslation();
  return (
    <section className="bg-osmoverse-900 pt-20">
      <NextSeo
        title={t("seo.disclaimer.title")}
        description={t("seo.disclaimer.description")}
      />
      <div className="mx-auto max-w-container overflow-y-auto p-5 md:h-full">
        <div className="text-center">
          <span>{t("seo.disclaimer.title")}</span>
        </div>
        <div className="md:caption my-5 mx-auto max-w-lg rounded-xl bg-osmoverse-700 p-4 text-xs text-white-mid">
          {t("seo.disclaimer.disclaimerFirst")}
          <br />
          <br />
          {t("seo.disclaimer.disclaimerSecond")}
        </div>
      </div>
      <div className="mx-auto max-w-container overflow-y-auto p-5 md:h-full">
        <div className="text-center">
          <span>Osmosis Privacy Policy</span>
        </div>
        <div className="md:caption my-5 mx-auto max-w-lg rounded-xl bg-osmoverse-700 p-4 text-xs text-white-mid">
          {t("seo.disclaimer.dataConsent")}
        </div>
      </div>
      <div className="mx-auto max-w-container overflow-y-auto p-5 md:h-full">
        <div className="text-center">
          <span>{t("seo.disclaimer.rekdrop")}</span>
        </div>
        <div className="md:caption my-5 mx-auto max-w-lg rounded-xl bg-osmoverse-700 p-4 text-xs text-white-mid">
          {t("seo.disclaimer.disclaimerThird")}
        </div>
      </div>
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
            possibility of technical failures or errors in third-party services.
          </p>
          <p>
            All services provided by these third-party entities are offered on
            an "as is" and "as available" basis. Osmosis Labs expressly
            disclaims all warranties, whether express or implied, including the
            warranties of merchantability, fitness for a particular purpose, and
            non-infringement. Osmosis Labs does not guarantee continuous,
            uninterrupted, error-free, or secure operation of any part of these
            third-party services.
          </p>
          <p>
            Osmosis Labs Pte. Ltd. ("Osmosis Labs"), along with its affiliates
            and respective officers, directors, agents, employees, and
            representatives, will not be liable for any types of damages arising
            out of or in connection with your use of third-party providers and
            bridges. These damages include direct, indirect, incidental,
            special, punitive, or consequential damages.
          </p>
          <p>
            You bear sole responsibility for the security of your private keys
            and the accuracy of your transaction details. Osmosis Labs urges you
            to exercise caution and conduct thorough due diligence before
            engaging with any third-party service. Loss or exposure of your
            private keys to unauthorized parties may result in the irreversible
            loss of your digital assets.
          </p>{" "}
          <p>
            Please be aware that transactions conducted through these
            third-party services are typically irreversible. Once a transaction
            is executed, it cannot be undone, and losses due to fraudulent,
            accidental, or incorrect transactions may be permanent and
            non-recoverable.
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
            constitutes your consent to such changes. It is your responsibility
            to review this disclaimer periodically.
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
            ecosystem, you signify that you have read, understood, and agreed to
            the terms outlined in this disclaimer.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Disclaimer;
