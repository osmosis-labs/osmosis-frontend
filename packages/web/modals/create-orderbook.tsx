import { FunctionComponent } from "react";

import { POOL_CREATION_FEE } from "~/components/complex/pool/create";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { EntityImage } from "~/components/ui/entity-image";
import { useTranslation } from "~/hooks/language";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { getLogoURIs } from "~/utils/logo-uri";

interface CreateOrderbookModalProps extends ModalBaseProps {
  baseDenom: string;
  baseSymbol: string;
  quoteDenom: string;
  quoteSymbol: string;
  baseCoinImageUrl?: string;
  quoteCoinImageUrl?: string;
  isCreating: boolean;
  acknowledgeFee: boolean;
  onAcknowledgeFee: (value: boolean) => void;
  onConfirm: () => void;
}

export const CreateOrderbookModal: FunctionComponent<
  CreateOrderbookModalProps
> = ({
  baseDenom,
  baseSymbol,
  quoteDenom,
  quoteSymbol,
  baseCoinImageUrl,
  quoteCoinImageUrl,
  isCreating,
  acknowledgeFee,
  onAcknowledgeFee,
  onConfirm,
  ...modalProps
}) => {
  const { t } = useTranslation();

  return (
    <ModalBase
      title={t("limitOrders.createOrderbook")}
      className="max-w-[400px]"
      {...modalProps}
    >
      <div className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Paired asset logo: base asset with quote asset overlaid bottom-right */}
          <div className="relative h-16 w-16">
            <EntityImage
              logoURIs={getLogoURIs(baseCoinImageUrl)}
              name={baseSymbol}
              symbol={baseSymbol}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div className="absolute -bottom-1 -right-1 h-7 w-7 overflow-hidden rounded-full border-2 border-osmoverse-800">
              <EntityImage
                logoURIs={getLogoURIs(quoteCoinImageUrl)}
                name={quoteSymbol}
                symbol={quoteSymbol}
                width={28}
                height={28}
                className="rounded-full"
              />
            </div>
          </div>
          <p className="body1 text-osmoverse-200">
            {t("limitOrders.noOrderbookForPair", {
              base: baseSymbol,
              quote: quoteSymbol,
            })}
          </p>
          <p className="body2 text-osmoverse-400">
            {t("limitOrders.createOrderbookDescription")}
          </p>
        </div>
        {/* Fee acknowledgement warning — same pattern as Create Pool */}
        <div className="rounded-xl bg-gradient-negative p-[2px]">
          <div className="flex items-center gap-3 rounded-xlinset bg-osmoverse-800 p-3.5">
            <Checkbox
              variant="destructive"
              checked={acknowledgeFee}
              onClick={() => onAcknowledgeFee(!acknowledgeFee)}
            />
            <label className="body2 cursor-pointer text-osmoverse-200">
              {t("pools.createPool.undersandCost", { POOL_CREATION_FEE })}
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            isLoading={isCreating}
            loadingText={<h6>{t("assets.transfer.loading")}</h6>}
            disabled={!acknowledgeFee}
            onClick={onConfirm}
          >
            <h6>{t("limitOrders.createOrderbook")}</h6>
          </Button>
          <Button variant="secondary" onClick={modalProps.onRequestClose}>
            {t("limitOrders.cancel")}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};
