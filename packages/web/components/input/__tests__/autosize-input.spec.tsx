import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";

import { AutosizeInput } from "~/components/input/autosize-input";

// jsdom has no layout: give each hidden sizer a width of 10px per character.
const CHAR_WIDTH = 10;
const originalScrollWidth = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollWidth"
);

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return (this.textContent ?? "").length * CHAR_WIDTH;
    },
  });
});

afterAll(() => {
  if (originalScrollWidth) {
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollWidth",
      originalScrollWidth
    );
  }
});

const widthOf = (input: HTMLElement) => input.style.width;

describe("AutosizeInput", () => {
  it("sizes to the value plus two pixels for the caret", () => {
    render(
      <AutosizeInput aria-label="amount" value="1234" onChange={() => {}} />
    );

    expect(widthOf(screen.getByLabelText("amount"))).toBe("42px");
  });

  it("sizes to the placeholder only while the value is empty", () => {
    const { rerender } = render(
      <AutosizeInput
        aria-label="amount"
        value=""
        placeholder="0.00000"
        onChange={() => {}}
      />
    );
    expect(widthOf(screen.getByLabelText("amount"))).toBe("72px");

    rerender(
      <AutosizeInput
        aria-label="amount"
        value="1"
        placeholder="0.00000"
        onChange={() => {}}
      />
    );
    expect(widthOf(screen.getByLabelText("amount"))).toBe("12px");
  });

  it("keeps the placeholder as the minimum when placeholderIsMinWidth is set", () => {
    render(
      <AutosizeInput
        aria-label="amount"
        value="1"
        placeholder="0.00000"
        placeholderIsMinWidth
        onChange={() => {}}
      />
    );

    expect(widthOf(screen.getByLabelText("amount"))).toBe("72px");
  });

  it("applies minWidth and extraWidth", () => {
    const { rerender } = render(
      <AutosizeInput
        aria-label="amount"
        value=""
        minWidth={30}
        onChange={() => {}}
      />
    );
    expect(widthOf(screen.getByLabelText("amount"))).toBe("30px");

    rerender(
      <AutosizeInput
        aria-label="amount"
        value="12"
        minWidth={30}
        extraWidth={20}
        onChange={() => {}}
      />
    );
    expect(widthOf(screen.getByLabelText("amount"))).toBe("42px");
  });

  it("forwards object and callback refs to the input", () => {
    const objectRef = createRef<HTMLInputElement>();
    const callbackRef = jest.fn();
    const { rerender } = render(
      <AutosizeInput value="" inputRef={objectRef} onChange={() => {}} />
    );
    expect(objectRef.current).toBeInstanceOf(HTMLInputElement);

    rerender(
      <AutosizeInput value="" inputRef={callbackRef} onChange={() => {}} />
    );
    expect(callbackRef).toHaveBeenLastCalledWith(expect.any(HTMLInputElement));
  });

  it("resizes as a controlled value is typed and reports each new width", () => {
    const onAutosize = jest.fn();
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <AutosizeInput
          aria-label="amount"
          value={value}
          onAutosize={onAutosize}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByLabelText("amount") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "12.5" } });

    expect(input.value).toBe("12.5");
    expect(widthOf(input)).toBe("42px");
    expect(onAutosize).toHaveBeenLastCalledWith(42);
  });
});
