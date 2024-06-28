import { ObservableAssetInfoConfig } from "~/hooks/ui-config";
import { createContext } from "~/utils/react-context";

const [AssetInfoViewProvider, useAssetInfoView] = createContext<{
  assetInfoConfig: ObservableAssetInfoConfig;
}>({
  name: "AssetInfoViewContext",
  strict: true,
});

export { AssetInfoViewProvider, useAssetInfoView };
