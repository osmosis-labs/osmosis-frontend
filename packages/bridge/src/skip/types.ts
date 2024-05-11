export const providerName = "Skip" as const;

export type SkipAsset = {
  denom: string;
  chain_id: string;

  origin_denom: string;
  origin_chain_id: string;
  trace: string;
  is_cw20: boolean;

  symbol?: string;
  name?: string;
  logo_uri?: string;
  decimals?: number;
  token_contract?: string;
  description?: string;
  coingecko_id?: string;
  recommended_symbol?: string;
};

export type SkipChain = {
  chain_name: string;
  chain_id: string;
  pfm_enabled: boolean;
  cosmos_sdk_version: string;
  supports_memo: boolean;
  logo_uri?: string;
  bech32_prefix: string;
  chain_type: string;
};

export type SkipRouteRequestBase = {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;

  cumulative_affiliate_fee_bps?: string;
  client_id?: string;
};

export type SkipRouteRequestGivenIn = SkipRouteRequestBase & {
  amount_in: string;
  amount_out?: never;
};

export type SkipRouteRequestGivenOut = SkipRouteRequestBase & {
  amount_in?: never;
  amount_out: string;
};

export type SkipRouteRequest =
  | SkipRouteRequestGivenIn
  | SkipRouteRequestGivenOut;

export type SkipRouteResponse = {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  amount_out: string;

  operations: SkipOperation[];
  chain_ids: string[];

  does_swap: boolean;
  estimated_amount_out?: string;
  swap_venue?: SkipSwapVenue;

  txs_required: number;

  usd_amount_in?: string;
  usd_amount_out?: string;
  swap_price_impact_percent?: string;
};

export type SkipOperation =
  | { transfer: SkipTransfer }
  | { swap: SkipSwap }
  | { axelar_transfer: SkipAxelarTransfer };

export type SkipTransfer = {
  port: string;
  channel: string;
  chain_id: string;
  pfm_enabled: boolean;
  dest_denom: string;
  supports_memo: boolean;
};

export type SkipSwap = (
  | { swap_in: SkipSwapExactCoinIn }
  | { swap_out: SkipSwapExactCoinOut }
) & {
  estimated_affiliate_fee?: string;
};

export type SkipSwapExactCoinIn = {
  swap_venue: SkipSwapVenue;
  swap_operations: SkipSwapOperation[];
  swap_amount_in?: string;
  price_impact_percent?: string;
};

export type SkipSwapVenue = {
  name: string;
  chain_id: string;
};

export type SkipSwapOperation = {
  pool: string;
  denom_in: string;
  denom_out: string;
};

export type SkipAxelarTransfer = {
  from_chain: string;
  from_chain_id: string;
  to_chain: string;
  to_chain_id: string;
  asset: string;
  should_unwrap: boolean;
  fee_amount: string;
  fee_asset: SkipAsset;
  is_testnet: boolean;
};

export type SkipSwapExactCoinOut = {
  swap_venue: SkipSwapVenue;
  swap_operations: SkipSwapOperation[];
  swap_amount_out: string;
  price_impact_percent?: string;
};

export type SkipMsgsRequest = {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  amount_out: string;
  address_list: string[];
  operations: SkipOperation[];

  estimated_amount_out?: string;
  slippage_tolerance_percent?: string;
  affiliates?: SkipAffiliate[];

  client_id?: string;
};

export type SkipAffiliate = {
  basis_points_fee: string;
  address: string;
};

export type SkipMsgsResponse = {
  msgs: SkipMsg[];
};

export type SkipMsg =
  | { multi_chain_msg: SkipMultiChainMsg }
  | { evm_tx: SkipEvmTx };

export type SkipMultiChainMsg = {
  chain_id: string;
  path: string[];
  msg: string;
  msg_type_url: string;
};

export type SkipEvmTx = {
  chain_id: string;
  to: string;
  value: string;
  data: string;
  required_erc20_approvals: SkipERC20Approval[];
};

export type SkipERC20Approval = {
  token_contract: string;
  spender: string;
  amount: string;
};

export type SkipStatusState =
  | "STATE_UNKNOWN"
  | "STATE_SUBMITTED"
  | "STATE_PENDING"
  | "STATE_RECEIVED"
  | "STATE_COMPLETED"
  | "STATE_ABANDONED"
  | "STATE_COMPLETED_SUCCESS"
  | "STATE_COMPLETED_ERROR";

export type SkipTxStatusResponse = {
  state: SkipStatusState;
};
