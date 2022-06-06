import { FunctionComponent, useState } from "react";
import { Button } from "../components/buttons";
import { ShowMoreButton } from "../components/buttons/show-more";
import { CheckBox } from "../components/control";
import { useWindowSize } from "../hooks";
import { ModalBase, ModalBaseProps } from "./base";

/** Can only be closed when a user clicks the checkbox and uses proceed button.
 *  State stored in localstorage.
 */
export const TermsModal: FunctionComponent<
  Omit<ModalBaseProps, "onRequestClose"> & { onAgree: () => void }
> = (props) => {
  const { isMobile } = useWindowSize();

  const [agree, setAgree] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showLicense, setShowLicense] = useState(false);

  return (
    <ModalBase {...props} onRequestClose={() => undefined} hideCloseButton>
      <div>
        <div className="max-w-modal">
          <div className="max-h-terms md:max-h-[16rem] overflow-y-scroll bg-background rounded-2xl p-5 mb-8">
            <div className="text-white-mid text-xs md:caption">
              Osmosis is a decentralized peer-to-peer blockchain that people can
              use to create liquidity and trade IBC enabled tokens. The Osmosis
              blockchain is made up of free, public, and open-source software.
              Your use of Osmosis involves various risks, including, but not
              limited, to losses while digital assets are being supplied to
              Osmosis pools and losses due to the fluctuation of prices of
              tokens in a trading pair or liquidity pool, including Impermanence
              Loss.
              {(!isMobile || showInfo) &&
                "Before using any pool on the Osmosis blockchain, you should review the relevant documentation to make sure you understand how Osmosis works, and the pool you use on Osmosis works. Additionally, just as you can access email protocols, such as SMTP, through multiple email clients, you can access pools on Osmosis through several web or mobile interfaces. You are responsible for doing your own diligence on those interfaces to understand the fees and risks they present."}
              {isMobile && !showInfo && (
                <ShowMoreButton
                  className="mt-1 mx-auto"
                  isOn={false}
                  onToggle={() => setShowInfo(true)}
                />
              )}
              <br />
              <br />
              AS DESCRIBED IN THE OSMOSIS LICENSES, THE OSMOSIS PROTOCOL IS
              PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY
              KIND. Although Osmosis Labs Pte. Ltd. ( “Osmosis Labs” ) developed
              much of the initial code for the Osmosis protocol, it does not
              provide, own, or control the Osmosis protocol, which is run by a
              decentralized validator set.
              {(!isMobile || showLicense) &&
                " Upgrades and modifications to the protocol are managed in a community-driven way by holders of the OSMO governance token. No developer or entity involved in creating the Osmosis protocol will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the Osmosis protocol, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value."}
              {isMobile && !showLicense && (
                <ShowMoreButton
                  className="mt-1 mx-auto"
                  isOn={false}
                  onToggle={() => setShowLicense(true)}
                />
              )}
            </div>
          </div>
          <div className="flex justify-center items-center text-white-high text-base md:text-sm mb-6">
            <CheckBox
              className="mr-3"
              isOn={agree}
              onToggle={() => {
                setAgree(!agree);
              }}
            >
              I understand the risks and would like to proceed
            </CheckBox>
          </div>
          <div className="w-full flex justify-center">
            <Button
              onClick={() => props.onAgree()}
              disabled={!agree}
              className="bg-primary-200 px-8 md:px-12.5 py-4 text-base md:text-lg text-white-high flex justify-center items-center rounded-lg hover:opacity-75 disabled:opacity-50"
            >
              Proceed
            </Button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};
