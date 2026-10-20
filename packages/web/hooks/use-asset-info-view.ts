import type { AssetInfoConfig } from "~/hooks/ui-config";
import { createContext } from "~/utils/react-context";

const [AssetInfoViewProvider, useAssetInfoView] = createContext<{
  assetInfoConfig: AssetInfoConfig;
}>({
  name: "AssetInfoViewContext",
  strict: true,
});

export { AssetInfoViewProvider, useAssetInfoView };
