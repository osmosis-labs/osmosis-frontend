import "@testing-library/jest-dom";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { ButtonHTMLAttributes, ReactNode, StrictMode } from "react";

import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";

// Keep these headless Stepper tests independent of asset lists and app providers.
jest.mock("~/components/assets", () => ({ Icon: () => null }));
jest.mock("~/components/buttons/icon-button", () => ({
  IconButton: ({
    icon: _icon,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode }) => (
    <button {...props} />
  ),
}));
jest.mock("../progress-bar", () => ({}));

const Impostor = (_props: { __TYPE: string }) => <div>Not a step</div>;

describe("Stepper", () => {
  it("counts Step elements without defaultProps and indexes only steps", () => {
    render(
      <StrictMode>
        <Stepper>
          <StepperLeftChevronNavigation />
          Intro
          {null}
          {false}
          <Step>First slide</Step>
          <Impostor __TYPE="Step" />
          <Step>Second slide</Step>
          <StepsIndicator />
          <Step>Third slide</Step>
          <StepperRightChevronNavigation />
        </Stepper>
      </StrictMode>
    );

    expect(screen.getAllByRole("button", { name: /^Step \d$/ })).toHaveLength(
      3
    );
    expect(screen.getByText("First slide")).not.toHaveClass("hidden");
    expect(screen.getByText("Second slide")).toHaveClass("hidden");
    expect(screen.getByText("Third slide")).toHaveClass("hidden");
    expect(
      screen.getByRole("button", { name: "Previous step" })
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("First slide")).toHaveClass("hidden");
    expect(screen.getByText("Second slide")).not.toHaveClass("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Step 3" }));
    expect(screen.getByText("Second slide")).toHaveClass("hidden");
    expect(screen.getByText("Third slide")).not.toHaveClass("hidden");
    expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
    expect(screen.getByText("Second slide")).not.toHaveClass("hidden");
  });

  it("autoplays recognized steps and stops on the last slide", () => {
    jest.useFakeTimers();
    try {
      render(
        <Stepper autoplay={{ delayInMs: 1000, stopOnLastSlide: true }}>
          <Step>First slide</Step>
          <StepsIndicator mode="pills" />
          <Step>Last slide</Step>
        </Stepper>
      );
      expect(screen.getAllByRole("button", { name: /^Step \d$/ })).toHaveLength(
        2
      );
      act(() => jest.advanceTimersByTime(1000));
      expect(screen.getByText("Last slide")).not.toHaveClass("hidden");
      act(() => jest.advanceTimersByTime(3000));
      expect(screen.getByText("Last slide")).not.toHaveClass("hidden");
    } finally {
      jest.useRealTimers();
    }
  });
});
