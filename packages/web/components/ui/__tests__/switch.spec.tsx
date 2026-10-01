import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, useState } from "react";

import { Switch } from "~/components/ui/switch";

describe("Switch with React 19", () => {
  it("keeps the button ref attached when checked changes", () => {
    const ref = jest.fn();
    const { rerender } = render(
      <Switch ref={ref} checked={false} aria-label="Trading" />
    );
    const button = screen.getByRole("switch");
    ref.mockClear();
    rerender(<Switch ref={ref} checked aria-label="Trading" />);
    expect(screen.getByRole("switch")).toBe(button);
    expect(button).toHaveAttribute("aria-checked", "true");
    expect(ref).not.toHaveBeenCalled();
  });

  it("toggles a controlled switch through its clickable panel", () => {
    function Panel() {
      const [checked, setChecked] = useState(true);
      return (
        <div onClick={() => setChecked((value) => !value)}>
          <Switch checked={checked} aria-label="Trading" />
        </div>
      );
    }
    render(
      <StrictMode>
        <Panel />
      </StrictMode>
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });
});
