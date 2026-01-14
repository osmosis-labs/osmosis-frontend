import { render, screen } from "@testing-library/react";
import React from "react";

import { useUserSettingsStore } from "../../stores/user-settings-store";
import { DesktopOnlyPrivateText } from "../privacy";

// Mock the useWindowSize hook
jest.mock("../../hooks", () => ({
  useWindowSize: jest.fn(),
}));

const { useWindowSize } = require("../../hooks");

describe("DesktopOnlyPrivateText", () => {
  beforeEach(() => {
    // Reset store to initial state
    useUserSettingsStore.setState({
      hideDust: false,
      hideBalances: false,
      language: "en",
      showUnverifiedAssets: false,
    });
    // Default to desktop
    useWindowSize.mockReturnValue({ isMobile: false });
  });

  it("should show text when hideBalances is false", () => {
    useUserSettingsStore.setState({ hideBalances: false });

    render(<DesktopOnlyPrivateText text="$1,234.56" />);

    expect(screen.getByText("$1,234.56")).toBeInTheDocument();
  });

  it("should show *** when hideBalances is true on desktop", () => {
    useUserSettingsStore.setState({ hideBalances: true });
    useWindowSize.mockReturnValue({ isMobile: false });

    render(<DesktopOnlyPrivateText text="$1,234.56" />);

    expect(screen.getByText("*****")).toBeInTheDocument();
    expect(screen.queryByText("$1,234.56")).not.toBeInTheDocument();
  });

  it("should show text when hideBalances is true on mobile", () => {
    useUserSettingsStore.setState({ hideBalances: true });
    useWindowSize.mockReturnValue({ isMobile: true });

    render(<DesktopOnlyPrivateText text="$1,234.56" />);

    expect(screen.getByText("$1,234.56")).toBeInTheDocument();
    expect(screen.queryByText("*****")).not.toBeInTheDocument();
  });

  it("should handle ReactElement as text", () => {
    useUserSettingsStore.setState({ hideBalances: false });

    render(
      <DesktopOnlyPrivateText
        text={<span data-testid="custom-element">Custom Content</span>}
      />
    );

    expect(screen.getByTestId("custom-element")).toBeInTheDocument();
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });

  it("should replace ReactElement with *** when hideBalances is true on desktop", () => {
    useUserSettingsStore.setState({ hideBalances: true });
    useWindowSize.mockReturnValue({ isMobile: false });

    render(
      <DesktopOnlyPrivateText
        text={<span data-testid="custom-element">Custom Content</span>}
      />
    );

    expect(screen.queryByTestId("custom-element")).not.toBeInTheDocument();
    expect(screen.getByText("*****")).toBeInTheDocument();
  });
});
