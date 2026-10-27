import { getDeepValue, shorten } from "@osmosis-labs/utils";
import classNames from "classnames";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { useDisclosure, useTranslation } from "~/hooks";
import { useForcedMigrations } from "~/hooks/use-forced-migrations";
import { ModalBase } from "~/modals/base";
import {
  ExternalLinkModal,
  handleExternalLink,
} from "~/modals/external-links-modal";
import {
  AssetVariantRow,
  InsufficientFeeTokensBanner,
} from "~/modals/variants-conversion";
import { interpolateBannerText } from "~/utils/asset-alerts";
import { ActiveForcedMigration } from "~/utils/forced-migrations";

const PORTFOLIO_PATHNAME = "/portfolio";

/**
 * App-wide popup for time-critical asset wind-downs. It can be snoozed but not
 * dismissed for good: it comes back until the wallet no longer holds the old
 * asset. The user still chooses when to convert (freeing funds held in pools
 * first) and signs every transaction.
 */
export const ForcedMigrationModal = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { visibleMigrations, snooze } = useForcedMigrations();

  // Keyed by denom so a row clearing its error flips the banner off; see the
  // same pattern in the variants conversion modal.
  const [insufficientFeeByDenom, setInsufficientFeeByDenom] = useState<
    Record<string, boolean>
  >({});
  const hasInsufficientFeeTokens = Object.values(insufficientFeeByDenom).some(
    Boolean
  );
  const reportInsufficientFeeTokens = useCallback(
    (coinMinimalDenom: string, hasInsufficient: boolean) => {
      setInsufficientFeeByDenom((prev) => {
        if (prev[coinMinimalDenom] === hasInsufficient) return prev;
        return { ...prev, [coinMinimalDenom]: hasInsufficient };
      });
    },
    []
  );

  const isOpen = visibleMigrations.length > 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clears the per-denom fee errors that rows reported once the popup closes
    if (!isOpen) setInsufficientFeeByDenom({});
  }, [isOpen]);

  // Every way out of the popup is a snooze, including the close button: the
  // popup comes back after it whatever the user picked.
  const snoozeVisible = useCallback(
    () => snooze(visibleMigrations.map(({ migration }) => migration.id)),
    [snooze, visibleMigrations]
  );

  const onViewPortfolio = useCallback(() => {
    snoozeVisible();
    router.push(PORTFOLIO_PATHNAME);
  }, [snoozeVisible, router]);

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={snoozeVisible}
      className="flex max-w-[500px] flex-col gap-6 bg-osmoverse-900"
    >
      {visibleMigrations.map((active, index) => (
        <MigrationSection
          key={active.migration.id}
          active={active}
          showDivider={index > 0}
          onViewPortfolio={onViewPortfolio}
          onInsufficientFeeTokens={reportInsufficientFeeTokens}
        />
      ))}
      {hasInsufficientFeeTokens && <InsufficientFeeTokensBanner />}
      <Button variant="outline" onClick={snoozeVisible}>
        {t("forcedMigration.remindMeLater")}
      </Button>
    </ModalBase>
  );
};

const MigrationSection: FunctionComponent<{
  active: ActiveForcedMigration;
  showDivider: boolean;
  onViewPortfolio: () => void;
  onInsufficientFeeTokens: (
    coinMinimalDenom: string,
    hasInsufficient: boolean
  ) => void;
}> = ({
  active: { migration, stage, convertibleVariants, heldElsewhere },
  showDivider,
  onViewPortfolio,
  onInsufficientFeeTokens,
}) => {
  const { t, language } = useTranslation();
  const {
    isOpen: isLeavingOsmosisOpen,
    onClose: onCloseLeavingOsmosis,
    onOpen: onOpenLeavingOsmosis,
  } = useDisclosure();

  const translations = migration.localization?.[language];
  const localize = (pathOrText: string) =>
    getDeepValue<string>(translations, pathOrText) ?? pathOrText;

  const deadlineText = useMemo(
    () =>
      migration.deadline
        ? formatDeadline(migration.deadline, language)
        : undefined,
    [migration.deadline, language]
  );

  const symbolsText = [
    ...new Set([
      ...convertibleVariants.map(
        (variant) => variant.amount.currency.coinDenom
      ),
      ...heldElsewhere.map((held) => held.coinDenom ?? shorten(held.denom)),
    ]),
  ].join(", ");

  const bodyPath =
    stage === "pastDeadline" && migration.enAfterDeadlineBodyOrLocalizationPath
      ? migration.enAfterDeadlineBodyOrLocalizationPath
      : migration.enBodyOrLocalizationPath;
  const body = interpolateBannerText(localize(bodyPath), {
    symbols: symbolsText,
    deadline: deadlineText ?? "",
  });

  const isWarning = stage !== "notice";
  const { link } = migration;

  return (
    <div className="flex flex-col gap-4">
      {showDivider && <div className="h-px w-full bg-osmoverse-700" />}
      <div className="flex items-start gap-3 pr-10">
        {isWarning && (
          <Icon
            id="alert-triangle"
            width={24}
            height={24}
            className="mt-0.5 min-w-[24px] text-rust-500"
          />
        )}
        <h6 className={classNames({ "text-rust-300": isWarning })}>
          {localize(migration.enTitleOrLocalizationPath)}
        </h6>
      </div>
      <p className="body1 text-osmoverse-300">{body}</p>
      {deadlineText && stage !== "pastDeadline" && (
        <p
          className={classNames("subtitle1", {
            "text-rust-300": isWarning,
            "text-osmoverse-200": !isWarning,
          })}
        >
          {t("forcedMigration.deadline", { date: deadlineText })}
        </p>
      )}
      {link &&
        (link.isExternal ? (
          <button
            className="body2 w-fit text-wosmongton-300 hover:underline"
            onClick={() =>
              handleExternalLink({
                url: link.url,
                openModal: onOpenLeavingOsmosis,
              })
            }
          >
            {localize(link.enTextOrLocalizationKey)}
          </button>
        ) : (
          <a
            className="body2 w-fit text-wosmongton-300 hover:underline"
            href={link.url}
          >
            {localize(link.enTextOrLocalizationKey)}
          </a>
        ))}
      {convertibleVariants.length > 0 && (
        <div className="flex flex-col">
          {convertibleVariants.map((variant, index) => (
            <AssetVariantRow
              key={variant.amount.currency.coinMinimalDenom}
              variant={variant}
              showBottomBorder={index !== convertibleVariants.length - 1}
              onInsufficientFeeTokens={onInsufficientFeeTokens}
            />
          ))}
        </div>
      )}
      {heldElsewhere.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-osmoverse-700 p-4">
          <p className="body2 text-osmoverse-300">
            {t("forcedMigration.heldElsewhere", {
              symbols: [
                ...new Set(
                  heldElsewhere.map(
                    (held) => held.coinDenom ?? shorten(held.denom)
                  )
                ),
              ].join(", "),
            })}
          </p>
          <button
            className="body2 w-fit text-wosmongton-300 hover:underline"
            onClick={onViewPortfolio}
          >
            {t("forcedMigration.viewPortfolio")}
          </button>
        </div>
      )}
      {link?.isExternal && (
        <ExternalLinkModal
          url={link.url}
          onRequestClose={onCloseLeavingOsmosis}
          isOpen={isLeavingOsmosisOpen}
        />
      )}
    </div>
  );
};

/** Long date in the user's language, in UTC so the day shown is the day the
 *  CMS entry names wherever the user is. */
function formatDeadline(deadline: string, language: string): string {
  const date = new Date(deadline);
  try {
    return new Intl.DateTimeFormat(language, {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(date);
  }
}
