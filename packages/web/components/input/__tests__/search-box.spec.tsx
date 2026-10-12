import { act, fireEvent, render, screen } from "@testing-library/react";

import { SearchBox } from "../search-box";

const DEBOUNCE_MS = 500;

const getInput = () => screen.getByRole("textbox") as HTMLInputElement;

/** Types into the input and lets the debounce fire, as a user pausing would. */
const typeAndSettle = (value: string) => {
  fireEvent.input(getInput(), { target: { value } });
  act(() => {
    jest.advanceTimersByTime(DEBOUNCE_MS);
  });
};

describe("SearchBox (debounced)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows a currentValue that arrives after mount, even while focused", () => {
    const { rerender } = render(
      <SearchBox debounce={DEBOUNCE_MS} onInput={jest.fn()} />
    );
    getInput().focus();

    // e.g. URL state read after hydration, or browser back/forward
    rerender(
      <SearchBox
        debounce={DEBOUNCE_MS}
        currentValue="atom"
        onInput={jest.fn()}
      />
    );

    expect(getInput().value).toBe("atom");
  });

  it("does not overwrite newer typing with its own value echoing back", () => {
    const onInput = jest.fn();
    const { rerender } = render(
      <SearchBox debounce={DEBOUNCE_MS} currentValue="" onInput={onInput} />
    );

    typeAndSettle("ato");
    expect(onInput).toHaveBeenCalledWith("ato");

    // The user keeps typing before the caller's state catches up.
    fireEvent.input(getInput(), { target: { value: "atom" } });
    rerender(
      <SearchBox debounce={DEBOUNCE_MS} currentValue="ato" onInput={onInput} />
    );

    expect(getInput().value).toBe("atom");
  });

  it("restores a typed value when navigating back and then forward to it", () => {
    const onInput = jest.fn();
    const { rerender } = render(
      <SearchBox debounce={DEBOUNCE_MS} currentValue="" onInput={onInput} />
    );

    typeAndSettle("atom");
    rerender(
      <SearchBox debounce={DEBOUNCE_MS} currentValue="atom" onInput={onInput} />
    );

    // back
    rerender(
      <SearchBox debounce={DEBOUNCE_MS} currentValue="" onInput={onInput} />
    );
    expect(getInput().value).toBe("");

    // forward
    rerender(
      <SearchBox debounce={DEBOUNCE_MS} currentValue="atom" onInput={onInput} />
    );
    expect(getInput().value).toBe("atom");
  });

  it("attaches a callback ref once instead of on every render", () => {
    // useDimension passes a state setter as the ref; re-attaching it on every
    // render loops until React throws "Maximum update depth exceeded".
    const ref = jest.fn();
    const { rerender } = render(
      <SearchBox ref={ref} debounce={DEBOUNCE_MS} onInput={jest.fn()} />
    );
    rerender(
      <SearchBox
        ref={ref}
        debounce={DEBOUNCE_MS}
        currentValue="atom"
        onInput={jest.fn()}
      />
    );

    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(getInput());
  });
});
