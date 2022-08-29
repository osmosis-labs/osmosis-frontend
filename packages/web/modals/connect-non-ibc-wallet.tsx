import { FunctionComponent, useState } from "react";
import { AssetSource, Source } from "../components/cards";
import { useConnectWalletModalRedirect } from "../hooks";
import { ModalBase, ModalBaseProps } from "./base";

export const ConnectNonIbcWallet: FunctionComponent<
  ModalBaseProps & {
    initiallySelectedSourceId?: string;
    isWithdraw: boolean;
    sources: Source[];
    onSelectSource: (key: string) => void;
  }
> = (props) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    props.initiallySelectedSourceId ?? null
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      className: "h-14 md:w-full w-96 mt-3 mx-auto !px-1",
      size: "lg",
      disabled:
        props.initiallySelectedSourceId === undefined && !selectedSourceId,
      onClick: () => {
        if (selectedSourceId) props.onSelectSource(selectedSourceId);
      },
      children: <span>Next</span>,
    },
    props.onRequestClose,
    "Connect Wallet"
  );

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={props.isWithdraw ? "Withdraw to" : "Deposit from"}
    >
      <div className="grid grid-cols-3 md:grid-cols-2 gap-4 m-4">
        {props.sources.map((source, i) => (
          <AssetSource
            key={i}
            {...source}
            isSelected={source.id === selectedSourceId}
            onClick={() => setSelectedSourceId(source.id)}
          />
        ))}
      </div>
      {accountActionButton}
    </ModalBase>
  );
};
