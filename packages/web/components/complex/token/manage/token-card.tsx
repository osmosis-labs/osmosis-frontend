import { CoinPretty, Int } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { FunctionComponent, useMemo, useState } from "react";

import { InputBox } from "~/components/input";
import { InfoTooltip } from "~/components/tooltip/info";
import { Button } from "~/components/ui/button";
import { EntityImage } from "~/components/ui/entity-image";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import {
  OSMO_ADDRESS_REGEX,
  TOKENFACTORY_BURN_ADDRESS,
} from "~/utils/tokenfactory";

type Action = "mint" | "burn" | "metadata" | "admin" | "list" | null;

interface Props {
  denom: string;
  walletAddress: string;
}

export const TokenCard: FunctionComponent<Props> = observer(
  ({ denom, walletAddress }) => {
    const { accountStore, queriesStore, chainStore } = useStore();
    const { t } = useTranslation();
    const account = accountStore.getWallet(accountStore.osmosisChainId);
    const osmosisChainId = accountStore.osmosisChainId;

    const queryMeta =
      queriesStore.get(osmosisChainId).osmosis?.queryDenomsMetadata;
    const queryAdmin = queriesStore
      .get(osmosisChainId)
      .osmosis?.queryDenomAuthorityMetadata.get(denom);

    const metadata = queryMeta?.getMetadataForDenom(denom);
    const adminLoaded = queryAdmin?.loaded ?? false;
    const admin = adminLoaded ? queryAdmin!.admin : undefined;
    const isAdmin = admin === walletAddress;
    const isRenounced =
      adminLoaded && (admin === TOKENFACTORY_BURN_ADDRESS || admin === "");

    const chainInfo = chainStore.getChain(osmosisChainId);
    const registeredCurrency = chainInfo.findCurrency(denom);
    const coinImageUrl = (registeredCurrency as any)?.coinImageUrl as
      | string
      | undefined;
    const isListed = Boolean(coinImageUrl);

    // Decimals are only known once metadata has resolved. Never assume 6 — an
    // incorrect exponent silently mis-scales every balance and supply display.
    const metadataDecimals = metadata?.denom_units?.find(
      (u) => u.denom === metadata.display
    )?.exponent;

    // Build a synthetic currency for unlisted tokens. Returns undefined until
    // on-chain metadata has been fetched so callers can show a loading state.
    const syntheticCurrency = useMemo(() => {
      if (registeredCurrency) return registeredCurrency;
      if (metadataDecimals === undefined) return undefined;
      return {
        coinMinimalDenom: denom,
        coinDecimals: metadataDecimals,
        coinDenom: metadata?.symbol || denom.split("/")[2] || denom,
      };
    }, [registeredCurrency, metadataDecimals, metadata, denom]);

    const denomBalanceQuery = queriesStore
      .get(osmosisChainId)
      .osmosis?.queryDenomBalance.getBalance(walletAddress, denom);
    const balanceDisplay =
      denomBalanceQuery && syntheticCurrency
        ? new CoinPretty(
            syntheticCurrency,
            new Int(denomBalanceQuery.balanceRaw)
          )
            .maxDecimals(syntheticCurrency.coinDecimals)
            .toString()
        : null;

    const totalSupplyQuery = queriesStore
      .get(osmosisChainId)
      .osmosis?.queryTotalSupply.get(denom);
    const totalSupplyDisplay =
      totalSupplyQuery && syntheticCurrency
        ? new CoinPretty(
            syntheticCurrency,
            new Int(totalSupplyQuery.totalSupplyRaw)
          )
            .maxDecimals(syntheticCurrency.coinDecimals)
            .toString()
        : null;

    const denomParts = denom.split("/");
    const subdenomLabel = denomParts.length === 3 ? denomParts[2] : denom;
    const displayName = metadata?.name || subdenomLabel;
    const displaySymbol = metadata?.symbol;

    const [activeAction, setActiveAction] = useState<Action>(null);
    const [isSending, setIsSending] = useState(false);
    const [snippetCopied, setSnippetCopied] = useState(false);

    // Mint state
    const [mintAmount, setMintAmount] = useState("");
    const [mintRecipient, setMintRecipient] = useState("");

    // Burn state
    const [burnAmount, setBurnAmount] = useState("");

    // Metadata state
    const [metaName, setMetaName] = useState("");
    const [metaSymbol, setMetaSymbol] = useState("");
    const [metaDecimals, setMetaDecimals] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaUri, setMetaUri] = useState("");
    const [metaUriHash, setMetaUriHash] = useState("");

    // Admin panel state
    const [newAdmin, setNewAdmin] = useState("");
    const [renounceChecked, setRenounceChecked] = useState(false);
    const [transferChecked, setTransferChecked] = useState(false);

    // List token panel state
    const [branch, setBranch] = useState("");
    const [logoPng, setLogoPng] = useState("");
    const [logoSvg, setLogoSvg] = useState("");
    const [socialWebsite, setSocialWebsite] = useState("");
    const [socialX, setSocialX] = useState("");
    const [socialTelegram, setSocialTelegram] = useState("");
    const [socialDiscord, setSocialDiscord] = useState("");
    const [socialGithub, setSocialGithub] = useState("");
    const [coingeckoId, setCoingeckoId] = useState("");
    const [extendedDescription, setExtendedDescription] = useState("");

    const openAction = (action: Action) => {
      setActiveAction(action);
      setIsSending(false);
      setRenounceChecked(false);
      setTransferChecked(false);
      setNewAdmin("");
      setSnippetCopied(false);
      setBranch("");
      setLogoPng("");
      setLogoSvg("");
      setSocialWebsite("");
      setSocialX("");
      setSocialTelegram("");
      setSocialDiscord("");
      setSocialGithub("");
      setCoingeckoId("");
      setExtendedDescription("");
      if (action === "metadata" && metadata) {
        setMetaName(metadata.name);
        setMetaSymbol(metadata.symbol);
        setMetaDecimals((metadataDecimals ?? "").toString());
        setMetaDescription(metadata.description);
        setMetaUri(metadata.uri);
        setMetaUriHash(metadata.uri_hash);
      }
    };

    const closeAction = () => {
      setActiveAction(null);
      setMintAmount("");
      setMintRecipient("");
      setBurnAmount("");
      setNewAdmin("");
      setRenounceChecked(false);
      setTransferChecked(false);
      setSnippetCopied(false);
      setBranch("");
      setLogoPng("");
      setLogoSvg("");
      setSocialWebsite("");
      setSocialX("");
      setSocialTelegram("");
      setSocialDiscord("");
      setSocialGithub("");
      setCoingeckoId("");
      setExtendedDescription("");
    };

    const handleMint = async () => {
      if (!mintAmount || metadataDecimals === undefined) return;
      const recipient = mintRecipient || walletAddress;
      setIsSending(true);
      try {
        await account?.osmosis.sendMintTokensMsg(
          denom,
          mintAmount,
          metadataDecimals,
          recipient,
          undefined,
          () => {
            setIsSending(false);
            closeAction();
          }
        );
      } catch {
        setIsSending(false);
      }
    };

    const handleBurn = async () => {
      if (!burnAmount || metadataDecimals === undefined) return;
      setIsSending(true);
      try {
        await account?.osmosis.sendBurnTokensMsg(
          denom,
          burnAmount,
          metadataDecimals,
          walletAddress,
          undefined,
          () => {
            setIsSending(false);
            closeAction();
          }
        );
      } catch {
        setIsSending(false);
      }
    };

    const handleUpdateMetadata = async () => {
      const decimals = parseInt(metaDecimals, 10);
      if (isNaN(decimals)) return;
      setIsSending(true);
      try {
        await account?.osmosis.sendUpdateDenomMetadataMsg(
          denom,
          {
            name: metaName,
            symbol: metaSymbol,
            description: metaDescription,
            decimals,
            uri: metaUri,
            uriHash: metaUriHash,
          },
          undefined,
          () => {
            setIsSending(false);
            closeAction();
          }
        );
      } catch {
        setIsSending(false);
      }
    };

    const handleChangeAdmin = async (target: string) => {
      if (!target) return;
      setIsSending(true);
      try {
        await account?.osmosis.sendChangeTokenAdminMsg(
          denom,
          target,
          undefined,
          () => {
            setIsSending(false);
            closeAction();
          }
        );
      } catch {
        setIsSending(false);
      }
    };

    const displaySymbolLower = (
      metadata?.symbol || subdenomLabel
    ).toLowerCase();
    // metadataDecimals is undefined until the metadata query resolves. The registry
    // snippet and openAction default to 0 in that state — acceptable since the
    // user can't meaningfully fill in the form until metadata has loaded anyway.
    const decimals = metadataDecimals ?? 0;

    const buildRegistryEntry = () => {
      const entry: Record<string, unknown> = {
        denom_units: [
          { denom, exponent: 0 },
          { denom: displaySymbolLower, exponent: decimals },
        ],
        type_asset: "sdk.coin",
        address: walletAddress,
        base: denom,
        name: displayName,
        display: displaySymbolLower,
        symbol: metadata?.symbol || subdenomLabel.toUpperCase(),
      };
      if (metadata?.description) entry.description = metadata.description;
      if (logoPng || logoSvg) {
        const logoURIs: Record<string, string> = {};
        const imageEntry: Record<string, string> = {};
        if (logoPng) {
          logoURIs.png = logoPng;
          imageEntry.png = logoPng;
        }
        if (logoSvg) {
          logoURIs.svg = logoSvg;
          imageEntry.svg = logoSvg;
        }
        entry.logo_URIs = logoURIs;
        entry.images = [imageEntry];
      }
      if (coingeckoId) entry.coingecko_id = coingeckoId;
      if (extendedDescription) entry.extended_description = extendedDescription;
      const socials: Record<string, string> = {};
      if (socialWebsite) socials.website = socialWebsite;
      if (socialX) socials.x = socialX;
      if (socialTelegram) socials.telegram = socialTelegram;
      if (socialDiscord) socials.discord = socialDiscord;
      if (socialGithub) socials.github = socialGithub;
      if (Object.keys(socials).length) entry.socials = socials;
      return entry;
    };

    const registrySnippet = JSON.stringify(buildRegistryEntry(), null, 2);

    const activeBranch = branch || `add-${subdenomLabel.toLowerCase()}-token`;

    const handleCopySnippet = () => {
      navigator.clipboard.writeText(registrySnippet).then(() => {
        setSnippetCopied(true);
        setTimeout(() => setSnippetCopied(false), 2000);
      });
    };

    const isValidUrl = (val: string) => {
      if (!val) return true;
      try {
        const { protocol } = new URL(val);
        return protocol === "https:" || protocol === "http:";
      } catch {
        return false;
      }
    };

    const logoPngError = !isValidUrl(logoPng);
    const logoSvgError = !isValidUrl(logoSvg);
    const websiteError = !isValidUrl(socialWebsite);
    const socialXError =
      socialX.length > 0 &&
      !/^https:\/\/(x\.com|twitter\.com)\/.+$/.test(socialX);
    const telegramError = !isValidUrl(socialTelegram);
    const discordError = !isValidUrl(socialDiscord);
    const githubError = !isValidUrl(socialGithub);

    const actionButtonClass = (action: Action) =>
      [
        "caption rounded-xl px-3 py-1.5 text-white transition-colors",
        activeAction === action
          ? "bg-wosmongton-500 hover:bg-wosmongton-400"
          : "bg-osmoverse-700 hover:bg-osmoverse-600",
      ].join(" ");

    return (
      <div className="flex flex-col rounded-2xl bg-osmoverse-800 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-4 gap-4">
          {/* Token identity — links to asset page only when listed */}
          {isListed ? (
            <Link
              href={`/assets/${encodeURIComponent(denom)}`}
              className="flex items-center gap-3 min-w-0 group"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <EntityImage
                  symbol={displaySymbol ?? subdenomLabel}
                  name={displayName}
                  logoURIs={{
                    png: coinImageUrl,
                    svg: coinImageUrl,
                  }}
                  height={40}
                  width={40}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="subtitle1 text-osmoverse-100 truncate group-hover:text-white-full transition-colors">
                  {displayName}
                </span>
                <span className="body2 text-osmoverse-400 truncate group-hover:text-osmoverse-300 transition-colors">
                  {displaySymbol ?? subdenomLabel}
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <EntityImage
                  symbol={displaySymbol ?? subdenomLabel}
                  name={displayName}
                  logoURIs={{
                    png: coinImageUrl,
                    svg: coinImageUrl,
                  }}
                  height={40}
                  width={40}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="subtitle1 text-osmoverse-100 truncate">
                  {displayName}
                </span>
                <span className="body2 text-osmoverse-400 truncate">
                  {displaySymbol ?? subdenomLabel}
                </span>
              </div>
            </div>
          )}

          {/* Right side: loading → renounced → admin actions → other admin */}
          {!adminLoaded ? (
            <span className="caption text-osmoverse-500 shrink-0 animate-pulse">
              {t("tokenFactory.manage.loadingAdmin")}
            </span>
          ) : isRenounced ? (
            <span className="caption text-osmoverse-500 shrink-0">
              {t("tokenFactory.manage.noAdmin")}
            </span>
          ) : isAdmin ? (
            <div className="flex shrink-0 items-center gap-2">
              {!isListed && (
                <button
                  onClick={() =>
                    openAction(activeAction === "list" ? null : "list")
                  }
                  className={[
                    "caption rounded-xl px-3 py-1.5 text-white transition-colors",
                    activeAction === "list"
                      ? "bg-wosmongton-500 hover:bg-wosmongton-400"
                      : "bg-ammelia-600 hover:bg-ammelia-500",
                  ].join(" ")}
                >
                  {t("tokenFactory.listToken")}
                </button>
              )}
              <button
                onClick={() =>
                  openAction(activeAction === "mint" ? null : "mint")
                }
                className={actionButtonClass("mint")}
              >
                {t("tokenFactory.manage.mint")}
              </button>
              <button
                onClick={() =>
                  openAction(activeAction === "burn" ? null : "burn")
                }
                className={actionButtonClass("burn")}
              >
                {t("tokenFactory.manage.burn")}
              </button>
              <button
                onClick={() =>
                  openAction(activeAction === "metadata" ? null : "metadata")
                }
                className={actionButtonClass("metadata")}
              >
                {t("tokenFactory.manage.updateMetadata")}
              </button>
              <button
                onClick={() =>
                  openAction(activeAction === "admin" ? null : "admin")
                }
                className={actionButtonClass("admin")}
              >
                {t("tokenFactory.manage.changeAdmin")}
              </button>
            </div>
          ) : (
            <span className="caption text-osmoverse-500 shrink-0 truncate max-w-xs">
              {t("tokenFactory.manage.admin")}: {admin}
            </span>
          )}
        </div>

        {/* List Token panel */}
        {activeAction === "list" && (
          <div className="border-t border-osmoverse-700 px-5 py-4 flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col gap-1">
              <span className="subtitle2 text-osmoverse-100">
                {t("tokenFactory.listTokenTitle")}
              </span>
              <p className="body2 text-osmoverse-300">
                {t("tokenFactory.listTokenSubtitle")}
              </p>
            </div>

            {/* Step 1 — upload logo */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="body2 font-semibold text-osmoverse-100">
                  {t("tokenFactory.listTokenStep1")}
                </span>
                <p className="caption text-osmoverse-400">
                  {t("tokenFactory.listTokenStep1Desc")}
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                className="self-start"
                asChild
              >
                <a
                  href="https://github.com/cosmos/chain-registry/upload/master/osmosis/images"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("tokenFactory.listTokenUploadLogo")}
                </a>
              </Button>
            </div>

            {/* Step 2 — branch name + fill in details */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="body2 font-semibold text-osmoverse-100">
                  {t("tokenFactory.listTokenStep2")}
                </span>
                <p className="caption text-osmoverse-400">
                  {t("tokenFactory.listTokenStep2Desc")}
                </p>
              </div>

              {/* Branch name */}
              <div className="flex flex-col gap-1.5 w-64">
                <div className="flex items-center gap-1">
                  <label className="body2 text-osmoverse-300">
                    {t("tokenFactory.listTokenBranch")}
                  </label>
                  <InfoTooltip
                    content={t("tokenFactory.listTokenBranchTooltip")}
                  />
                </div>
                <InputBox
                  currentValue={branch}
                  onInput={setBranch}
                  placeholder={t(
                    "tokenFactory.listTokenBranchPlaceholder"
                  ).replace("{symbol}", subdenomLabel.toLowerCase())}
                />
              </div>

              {/* Logo URLs — SVG first (preferred), PNG second (fallback) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label className="body2 text-osmoverse-300">
                      {t("tokenFactory.listTokenLogoSvg")}
                    </label>
                    <span className="caption text-missionError">*</span>
                    <InfoTooltip
                      content={t("tokenFactory.listTokenLogoSvgTooltip")}
                    />
                  </div>
                  <InputBox
                    currentValue={logoSvg}
                    onInput={setLogoSvg}
                    placeholder="https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/SYMBOL.svg"
                    style={logoSvgError ? "error" : "enabled"}
                  />
                  {logoSvgError && (
                    <span className="caption text-missionError">
                      {t("tokenFactory.create.errors.uriInvalid")}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label className="body2 text-osmoverse-300">
                      {t("tokenFactory.listTokenLogoPng")}
                    </label>
                    <span className="caption text-missionError">*</span>
                    <InfoTooltip
                      content={t("tokenFactory.listTokenLogoPngTooltip")}
                    />
                  </div>
                  <InputBox
                    currentValue={logoPng}
                    onInput={setLogoPng}
                    placeholder="https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/SYMBOL.png"
                    style={logoPngError ? "error" : "enabled"}
                  />
                  {logoPngError && (
                    <span className="caption text-missionError">
                      {t("tokenFactory.create.errors.uriInvalid")}
                    </span>
                  )}
                </div>
              </div>

              <p className="caption text-osmoverse-500">
                <span className="text-missionError">* </span>
                {t("tokenFactory.listTokenLogoRequiredNote")}
              </p>
              <p className="caption text-osmoverse-500">
                {t("tokenFactory.listTokenLogoNote")}
              </p>

              {/* Socials + CoinGecko — all optional */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label className="body2 text-osmoverse-300">
                      {t("tokenFactory.listTokenWebsite")}
                    </label>
                    <InfoTooltip
                      content={t("tokenFactory.listTokenWebsiteTooltip")}
                    />
                  </div>
                  <InputBox
                    currentValue={socialWebsite}
                    onInput={setSocialWebsite}
                    placeholder="https://yourproject.io"
                    style={websiteError ? "error" : "enabled"}
                  />
                  {websiteError && (
                    <span className="caption text-missionError">
                      {t("tokenFactory.create.errors.uriInvalid")}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label className="body2 text-osmoverse-300">
                      {t("tokenFactory.listTokenX")}
                    </label>
                    <InfoTooltip
                      content={t("tokenFactory.listTokenXTooltip")}
                    />
                  </div>
                  <InputBox
                    currentValue={socialX}
                    onInput={setSocialX}
                    placeholder="https://x.com/yourhandle"
                    style={socialXError ? "error" : "enabled"}
                  />
                  {socialXError && (
                    <span className="caption text-missionError">
                      {t("tokenFactory.create.errors.invalidXUrl")}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label className="body2 text-osmoverse-300">
                      {t("tokenFactory.listTokenTelegram")}
                    </label>
                    <InfoTooltip
                      content={t("tokenFactory.listTokenTelegramTooltip")}
                    />
                  </div>
                  <InputBox
                    currentValue={socialTelegram}
                    onInput={setSocialTelegram}
                    placeholder="https://t.me/yourgroup"
                    style={telegramError ? "error" : "enabled"}
                  />
                  {telegramError && (
                    <span className="caption text-missionError">
                      {t("tokenFactory.create.errors.uriInvalid")}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label className="body2 text-osmoverse-300">
                      {t("tokenFactory.listTokenDiscord")}
                    </label>
                    <InfoTooltip
                      content={t("tokenFactory.listTokenDiscordTooltip")}
                    />
                  </div>
                  <InputBox
                    currentValue={socialDiscord}
                    onInput={setSocialDiscord}
                    placeholder="https://discord.gg/yourserver"
                    style={discordError ? "error" : "enabled"}
                  />
                  {discordError && (
                    <span className="caption text-missionError">
                      {t("tokenFactory.create.errors.uriInvalid")}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label className="body2 text-osmoverse-300">
                      {t("tokenFactory.listTokenGithub")}
                    </label>
                    <InfoTooltip
                      content={t("tokenFactory.listTokenGithubTooltip")}
                    />
                  </div>
                  <InputBox
                    currentValue={socialGithub}
                    onInput={setSocialGithub}
                    placeholder="https://github.com/yourorg"
                    style={githubError ? "error" : "enabled"}
                  />
                  {githubError && (
                    <span className="caption text-missionError">
                      {t("tokenFactory.create.errors.uriInvalid")}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <label className="body2 text-osmoverse-300">
                      {t("tokenFactory.listTokenCoingecko")}
                    </label>
                    <InfoTooltip
                      content={t("tokenFactory.listTokenCoingeckoTooltip")}
                    />
                  </div>
                  <InputBox
                    currentValue={coingeckoId}
                    onInput={setCoingeckoId}
                    placeholder="my-token"
                  />
                </div>
              </div>

              {/* Extended description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1">
                  <label className="body2 text-osmoverse-300">
                    {t("tokenFactory.listTokenExtendedDesc")}
                  </label>
                  <InfoTooltip
                    content={t("tokenFactory.listTokenExtendedDescTooltip")}
                  />
                </div>
                <InputBox
                  currentValue={extendedDescription}
                  onInput={setExtendedDescription}
                  placeholder={t(
                    "tokenFactory.listTokenExtendedDescPlaceholder"
                  )}
                />
              </div>
            </div>

            {/* Step 3 — copy snippet and open PR */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="body2 font-semibold text-osmoverse-100">
                  {t("tokenFactory.listTokenStep3")}
                </span>
                <p className="caption text-osmoverse-400">
                  {t("tokenFactory.listTokenStep3Desc")}
                </p>
              </div>
              <div className="rounded-xl bg-osmoverse-900 p-3 font-mono text-xs text-osmoverse-200 overflow-x-auto whitespace-pre">
                {registrySnippet}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="secondary" size="md" onClick={handleCopySnippet}>
                {snippetCopied
                  ? t("tokenFactory.listTokenCopied")
                  : t("tokenFactory.listTokenCopy")}
              </Button>
              <Button size="md" asChild>
                <a
                  href={`https://github.com/cosmos/chain-registry/edit/${activeBranch}/osmosis/assetlist.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("tokenFactory.listTokenEditRegistry")}
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Mint panel */}
        {activeAction === "mint" && (
          <div className="border-t border-osmoverse-700 px-5 py-4 flex flex-col gap-3">
            <div className="flex gap-4">
              {balanceDisplay && (
                <p className="caption text-osmoverse-400">
                  {t("tokenFactory.manage.currentBalance")}: {balanceDisplay}
                </p>
              )}
              {totalSupplyDisplay && (
                <p className="caption text-osmoverse-400">
                  {t("tokenFactory.manage.totalSupply")}: {totalSupplyDisplay}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="body2 text-osmoverse-300">
                {t("tokenFactory.manage.mintAmount")}
              </label>
              <InputBox
                currentValue={mintAmount}
                onInput={setMintAmount}
                placeholder="100"
                inputMode="numeric"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="body2 text-osmoverse-300">
                {t("tokenFactory.manage.recipientAddress")}
              </label>
              <InputBox
                currentValue={mintRecipient}
                onInput={setMintRecipient}
                placeholder={t("tokenFactory.create.mintRecipientHint")}
                style={
                  mintRecipient && !OSMO_ADDRESS_REGEX.test(mintRecipient)
                    ? "error"
                    : "enabled"
                }
              />
              {mintRecipient && !OSMO_ADDRESS_REGEX.test(mintRecipient) && (
                <span className="caption text-missionError">
                  {t("tokenFactory.create.errors.invalidAddress")}
                </span>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="md" onClick={closeAction}>
                {t("tokenFactory.manage.cancel")}
              </Button>
              <Button
                size="md"
                onClick={handleMint}
                disabled={
                  !mintAmount ||
                  metadataDecimals === undefined ||
                  isSending ||
                  (!!mintRecipient && !OSMO_ADDRESS_REGEX.test(mintRecipient))
                }
              >
                {t("tokenFactory.manage.mint")}
              </Button>
            </div>
          </div>
        )}

        {/* Burn panel */}
        {activeAction === "burn" && (
          <div className="border-t border-osmoverse-700 px-5 py-4 flex flex-col gap-3">
            <div className="flex gap-4">
              {balanceDisplay && (
                <p className="caption text-osmoverse-400">
                  {t("tokenFactory.manage.currentBalance")}: {balanceDisplay}
                </p>
              )}
              {totalSupplyDisplay && (
                <p className="caption text-osmoverse-400">
                  {t("tokenFactory.manage.totalSupply")}: {totalSupplyDisplay}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="body2 text-osmoverse-300">
                {t("tokenFactory.manage.burnAmount")}
              </label>
              <InputBox
                currentValue={burnAmount}
                onInput={setBurnAmount}
                placeholder="100"
                inputMode="numeric"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="md" onClick={closeAction}>
                {t("tokenFactory.manage.cancel")}
              </Button>
              <Button
                size="md"
                onClick={handleBurn}
                disabled={
                  !burnAmount || metadataDecimals === undefined || isSending
                }
              >
                {t("tokenFactory.manage.burn")}
              </Button>
            </div>
          </div>
        )}

        {/* Metadata panel */}
        {activeAction === "metadata" && (
          <div className="border-t border-osmoverse-700 px-5 py-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="body2 text-osmoverse-300">
                  {t("tokenFactory.manage.name")}
                </label>
                <InputBox
                  currentValue={metaName}
                  onInput={setMetaName}
                  placeholder={t("tokenFactory.create.namePlaceholder")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="body2 text-osmoverse-300">
                  {t("tokenFactory.manage.symbol")}
                </label>
                <InputBox
                  currentValue={metaSymbol}
                  onInput={(v) => setMetaSymbol(v.toUpperCase())}
                  placeholder="MYTKN"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1">
                  <label className="body2 text-osmoverse-300">
                    {t("tokenFactory.manage.decimals")}
                  </label>
                  <InfoTooltip
                    content={t("tokenFactory.create.decimalsTooltip")}
                  />
                </div>
                <InputBox
                  currentValue={metaDecimals}
                  onInput={setMetaDecimals}
                  inputMode="numeric"
                  placeholder="6"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="body2 text-osmoverse-300">
                  {t("tokenFactory.manage.uri")}
                </label>
                <InputBox
                  currentValue={metaUri}
                  onInput={setMetaUri}
                  placeholder="https://..."
                />
                <span className="caption text-osmoverse-500">
                  {t("tokenFactory.create.uriHint")}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="body2 text-osmoverse-300">
                {t("tokenFactory.manage.description")}
              </label>
              <InputBox
                currentValue={metaDescription}
                onInput={setMetaDescription}
                placeholder={t("tokenFactory.create.descriptionPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="body2 text-osmoverse-300">
                {t("tokenFactory.manage.uriHash")}
              </label>
              <InputBox
                currentValue={metaUriHash}
                onInput={setMetaUriHash}
                placeholder={t("tokenFactory.manage.uriHashPlaceholder")}
              />
              <span className="caption text-osmoverse-500">
                {t("tokenFactory.create.uriHashHint")}
              </span>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="md" onClick={closeAction}>
                {t("tokenFactory.manage.cancel")}
              </Button>
              <Button
                size="md"
                onClick={handleUpdateMetadata}
                disabled={!metaName || !metaSymbol || isSending}
              >
                {t("tokenFactory.manage.confirm")}
              </Button>
            </div>
          </div>
        )}

        {/* Admin panel — two-column layout */}
        {activeAction === "admin" && (
          <div className="border-t border-osmoverse-700 px-5 py-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Left: Renounce Admin */}
              <div className="flex flex-col justify-between gap-3 rounded-xl bg-osmoverse-700 p-4">
                <div className="flex flex-col gap-1">
                  <span className="subtitle2 text-missionError">
                    {t("tokenFactory.manage.renounceAdminTitle")}
                  </span>
                  <p className="caption text-osmoverse-300">
                    {t("tokenFactory.manage.renounceAdminDescription")}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={renounceChecked}
                      onChange={(e) => setRenounceChecked(e.target.checked)}
                      className="h-4 w-4 shrink-0 accent-missionError"
                    />
                    <span className="caption text-osmoverse-200">
                      {t("tokenFactory.manage.renounceAdminConfirmCheck")}
                    </span>
                  </label>
                  <Button
                    variant="destructive"
                    size="md"
                    className="w-full"
                    disabled={!renounceChecked || isSending}
                    onClick={() => handleChangeAdmin(TOKENFACTORY_BURN_ADDRESS)}
                  >
                    {t("tokenFactory.manage.renounceAdmin")}
                  </Button>
                </div>
              </div>

              {/* Right: Transfer Admin */}
              <div className="flex flex-col justify-between gap-3 rounded-xl bg-osmoverse-700 p-4">
                <div className="flex flex-col gap-1">
                  <span className="subtitle2 text-osmoverse-100">
                    {t("tokenFactory.manage.transferAdminTitle")}
                  </span>
                  <p className="caption text-osmoverse-300">
                    {t("tokenFactory.manage.transferAdminDescription")}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <InputBox
                    currentValue={newAdmin}
                    onInput={(v) => {
                      setNewAdmin(v);
                      setTransferChecked(false);
                    }}
                    placeholder={t("tokenFactory.manage.newAdminPlaceholder")}
                    style={
                      newAdmin && !OSMO_ADDRESS_REGEX.test(newAdmin)
                        ? "error"
                        : "enabled"
                    }
                  />
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={transferChecked}
                      onChange={(e) => setTransferChecked(e.target.checked)}
                      disabled={!newAdmin}
                      className="h-4 w-4 shrink-0 accent-wosmongton-400 disabled:opacity-40"
                    />
                    <span
                      className={[
                        "caption",
                        newAdmin ? "text-osmoverse-200" : "text-osmoverse-500",
                      ].join(" ")}
                    >
                      {t("tokenFactory.manage.transferAdminConfirmCheck")}
                    </span>
                  </label>
                  <Button
                    size="md"
                    className="w-full"
                    disabled={
                      !newAdmin ||
                      !OSMO_ADDRESS_REGEX.test(newAdmin) ||
                      !transferChecked ||
                      isSending
                    }
                    onClick={() => handleChangeAdmin(newAdmin)}
                  >
                    {t("tokenFactory.manage.transferAdmin")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="md" onClick={closeAction}>
                {t("tokenFactory.manage.cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
