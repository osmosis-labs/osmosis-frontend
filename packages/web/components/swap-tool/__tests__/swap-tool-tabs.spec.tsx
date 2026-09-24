import { render, screen } from "@testing-library/react";

import {
  SwapToolTab,
  SwapToolTabs,
} from "~/components/swap-tool/swap-tool-tabs";

jest.mock("~/hooks", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("SwapToolTabs", () => {
  it("shows Buy, Sell and Swap tabs by default", () => {
    render(<SwapToolTabs activeTab={SwapToolTab.SWAP} setTab={jest.fn()} />);

    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("shows only the Swap tab when limit order tabs are hidden", () => {
    const setTab = jest.fn();
    render(
      <SwapToolTabs
        activeTab={SwapToolTab.SWAP}
        setTab={setTab}
        showLimitOrderTabs={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);

    buttons[0].click();
    expect(setTab).toHaveBeenCalledWith(SwapToolTab.SWAP);
  });
});
