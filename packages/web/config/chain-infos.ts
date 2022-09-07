import { ChainInfoWithExplorer } from "../stores/chain";
import { getAllChainInfosFromAssets } from "./utils";

const chainInfos = getAllChainInfosFromAssets();

export const ChainInfos: ChainInfoWithExplorer[] = chainInfos;
