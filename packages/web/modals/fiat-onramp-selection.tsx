import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { AssetSourceCard } from "../components/cards";
import {
  FiatRampKey,
  SourceChainKey,
  Wallet,
  FiatRampDisplayInfos,
} from "../integrations";
import { ModalBase, ModalBaseProps } from "./base";
import { useTranslation } from "react-multi-lang";
import { useTransferConfig } from "../hooks";

/** Prompts user to connect from a list of wallets. Will onboard a user for an uninstalled wallet if the functionality is available. */
export const FiatOnrampSelectModal: FunctionComponent<
  ModalBaseProps & {
    initiallySelectedWalletId?: string;
    desiredSourceKey?: SourceChainKey;
    isWithdraw: boolean;
    fiatRamps?: FiatRampKey[];
    onSelectSource: (key: string) => void;
  }
> = observer((props) => {
  const t = useTranslation();
  const transferConfig = useTransferConfig();

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen}
      title={<h6 className="mb-4">{t("chooseOnramp")}</h6>}
    >
      <div className="m-4 grid grid-cols-3 gap-4 md:grid-cols-2">
        {props.fiatRamps?.map((fiatRampKey, index) => (
          <AssetSourceCard
            key={index}
            id={fiatRampKey}
            {...FiatRampDisplayInfos[fiatRampKey]}
            onClick={() => transferConfig.buyOsmo()}
          />
        ))}
      </div>
    </ModalBase>
  );
});




// import Link from "next/link";
// import Image from "next/image";
// import React, { FunctionComponent } from "react";
// import { observer } from "mobx-react-lite";
// import { ModalBase, ModalBaseProps } from "./base";
// import { useTranslation } from "react-multi-lang";
// import { FiatRampKey } from "../integrations";
// import { useTransferConfig } from "../hooks";

// export const FiatOnrampSelectModal: FunctionComponent<
//   ModalBaseProps & {
//     fiatRamps?: FiatRampKey[];
//   }
// > = observer((props) => {
//   const t = useTranslation();
//   const transferConfig = useTransferConfig();

//   return (
//     <ModalBase
//       {...props}
//       isOpen={props.isOpen && showModalBase}
//       onRequestClose={onRequestClose}
//       className="max-w-[30.625rem]"
//       title={<h6 className="mb-4">{t("chooseOnramp")}</h6>}
//     >
//         <button
//           className="flex items-center rounded-2xl bg-osmoverse-900 p-5 transition-colors hover:bg-osmoverse-700"
//           onClick={(e) => {
//             e.preventDefault();
//             onSelectExtension();
//           }}
//         >
//           <Image
//             src="/logos/kado.svg"
//             alt="kado logo"
//             width={64}
//             height={64}
//           />
//           <div className="ml-5 flex flex-col text-left">
//             <h6>Kado</h6>
//             <p className="body2 mt-1 text-osmoverse-400">
//               {t("supports")} USDC
//             </p>
//           </div>
//           <p className="body2 mt-1 text-osmoverse-400">
//             {}
//           </p>
//         </button>
//       <button
//         className="mt-5 flex items-center rounded-2xl bg-osmoverse-900 p-5 transition-colors hover:bg-osmoverse-700"
//         onClick={(e) => {
//           e.preventDefault();
//           onSelectWalletConnect();
//         }}
//       >
//         <Image
//           src="/logos/transak.svg"
//           alt="transak logo"
//           width={64}
//           height={64}
//         />
//         <div className="ml-5 flex flex-col text-left">
//           <h6>Transak</h6>
//           <p className="body2 mt-1 text-osmoverse-400">
//               {t("supports")} OSMO
//           </p>
//         </div>
//       </button>
//       <div className="mt-5 rounded-2xl bg-osmoverse-700 p-5">
//         <p className="caption text-white-mid">
//           {t("connectDisclaimer")}{" "}
//           <Link href="/disclaimer" passHref>
//             <a className="underline" target="_blank" rel="noopener noreferrer">
//               {t("protocolDisclaimer")}
//             </a>
//           </Link>
//           .
//         </p>
//       </div>


//       {props.fiatRamps?.map((fiatRampKey, index) => (
//           <AssetSourceCard
//             key={index}
//             id={fiatRampKey}
//             {...FiatRampDisplayInfos[fiatRampKey]}
//             isSelected={fiatRampKey === selectedAssetSourceKey}
//             onClick={() => setSelectedAssetSourceKey(fiatRampKey)}
//           />
//         ))}
//     </ModalBase>
//   );
// };
