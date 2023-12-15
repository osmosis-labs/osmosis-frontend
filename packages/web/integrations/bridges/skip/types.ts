export type Asset = {
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

export type Chain = {
  chain_name: string;
  chain_id: string;
  pfm_enabled: boolean;
  cosmos_sdk_version: string;
  supports_memo: boolean;
  logo_uri?: string;
  bech32_prefix: string;
  chain_type: string;
};

export type RouteRequestBase = {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;

  cumulative_affiliate_fee_bps?: string;
  client_id?: string;
};

export type RouteRequestGivenIn = RouteRequestBase & {
  amount_in: string;
  amount_out?: never;
};

export type RouteRequestGivenOut = RouteRequestBase & {
  amount_in?: never;
  amount_out: string;
};

export type RouteRequest = RouteRequestGivenIn | RouteRequestGivenOut;

export type RouteResponse = {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  amount_out: string;

  operations: Operation[];
  chain_ids: string[];

  does_swap: boolean;
  estimated_amount_out?: string;
  swap_venue?: SwapVenue;

  txs_required: number;

  usd_amount_in?: string;
  usd_amount_out?: string;
  swap_price_impact_percent?: string;
};

export type Operation =
  | { transfer: Transfer }
  | { swap: Swap }
  | { axelar_transfer: AxelarTransfer };

export type Transfer = {
  port: string;
  channel: string;
  chain_id: string;
  pfm_enabled: boolean;
  dest_denom: string;
  supports_memo: boolean;
};

export type Swap = (
  | { swap_in: SwapExactCoinIn }
  | { swap_out: SwapExactCoinOut }
) & {
  estimated_affiliate_fee?: string;
};

export type SwapExactCoinIn = {
  swap_venue: SwapVenue;
  swap_operations: SwapOperation[];
  swap_amount_in?: string;
  price_impact_percent?: string;
};

export type SwapVenue = {
  name: string;
  chain_id: string;
};

export type SwapOperation = {
  pool: string;
  denom_in: string;
  denom_out: string;
};

export type AxelarTransfer = {
  from_chain: string;
  from_chain_id: string;
  to_chain: string;
  to_chain_id: string;
  asset: string;
  should_unwrap: boolean;
  fee_amount: string;
  fee_asset: Asset;
  is_testnet: boolean;
};

export type SwapExactCoinOut = {
  swap_venue: SwapVenue;
  swap_operations: SwapOperation[];
  swap_amount_out: string;
  price_impact_percent?: string;
};

export type MsgsRequest = {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  amount_out: string;
  address_list: string[];
  operations: Operation[];

  estimated_amount_out?: string;
  slippage_tolerance_percent?: string;
  affiliates?: Affiliate[];

  client_id?: string;
};

export type Affiliate = {
  basis_points_fee: string;
  address: string;
};

export type MsgsResponse = {
  msgs: Msg[];
};

export type Msg = { multi_chain_msg: MultiChainMsg } | { evm_tx: EvmTx };

export type MultiChainMsg = {
  chain_id: string;
  path: string[];
  msg: string;
  msg_type_url: string;
};

export type EvmTx = {
  chain_id: string;
  to: string;
  value: string;
  data: string;
  required_erc20_approvals: ERC20Approval[];
};

export type ERC20Approval = {
  token_contract: string;
  spender: string;
  amount: string;
};

export type StatusState =
  | "STATE_UNKNOWN"
  | "STATE_SUBMITTED"
  | "STATE_PENDING"
  | "STATE_RECEIVED"
  | "STATE_COMPLETED"
  | "STATE_ABANDONED"
  | "STATE_COMPLETED_SUCCESS"
  | "STATE_COMPLETED_ERROR";

export type TxStatusResponse = {
  state: StatusState;
};
