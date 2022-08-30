import { ChainInfoWithExplorer } from "../stores/chain";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { createKeplrChainInfos, getAllChainInfosFromAssets, SimplifiedChainInfo } from "./utils";

const chainInfos = getAllChainInfosFromAssets();

export const ChainInfos: ChainInfoWithExplorer[] = chainInfos;

