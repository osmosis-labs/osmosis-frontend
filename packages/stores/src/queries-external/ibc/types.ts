export type IbcStatus = "normal" | "congested" | "blocked";

export interface IbcStatusData {
  source: string;
  destination: string;
  channel_id: string;
  token_symbol: string;
  token_name: string;
  last_tx: string;
  size_queue: number;
  duration_minutes: number;
}
