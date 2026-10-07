/* eslint-disable import/no-extraneous-dependencies */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, StrictMode, useState } from "react";

import { AutosizeInput } from "../autosize-input";
import { InputBox } from "../input-box";

let characterWidth = 10;

beforeEach(() => {
  characterWidth = 10;
  jest
    .spyOn(HTMLElement.prototype, "scrollWidth", "get")
    .mockImplementation(function (this: HTMLElement) {
      return (this.textContent?.length ?? 0) * characterWidth;
    });
});

afterEach(() => jest.restoreAllMocks());

it("measures controlled text, preserving whitespace, with caret room and minimum width", () => {
  const onAutosize = jest.fn();
  const { rerender, container } = render(
    <AutosizeInput
      value="1  "
      minWidth={30}
      onChange={() => {}}
      onAutosize={onAutosize}
    />
  );
  const input = screen.getByRole("textbox");
  expect(input.style.width).toBe("32px");
  expect(input.style.boxSizing).toBe("content-box");
  expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe(
    "1  "
  );
  expect(onAutosize).toHaveBeenLastCalledWith(32);

  rerender(
    <AutosizeInput
      value=""
      minWidth={30}
      onChange={() => {}}
      onAutosize={onAutosize}
    />
  );
  expect(input.style.width).toBe("30px");
  expect(onAutosize).toHaveBeenLastCalledWith(30);
  const calls = onAutosize.mock.calls.length;
  fireEvent(window, new Event("resize"));
  expect(onAutosize).toHaveBeenCalledTimes(calls);
});

it("sizes empty values to the placeholder, then shrinks unless it is a minimum", () => {
  const { rerender } = render(
    <AutosizeInput value="" placeholder="0.5%" onChange={() => {}} />
  );
  const input = screen.getByRole("textbox");
  expect(input.style.width).toBe("42px");
  rerender(<AutosizeInput value="1" placeholder="0.5%" onChange={() => {}} />);
  expect(input.style.width).toBe("12px");
  rerender(
    <AutosizeInput
      value="1"
      placeholder="0.5%"
      placeholderIsMinWidth
      extraWidth={3}
      onChange={() => {}}
    />
  );
  expect(input.style.width).toBe("45px");
  rerender(<AutosizeInput value="0" placeholder="0.5%" onChange={() => {}} />);
  expect(input.style.width).toBe("12px");
});

it("reserves room for number steppers only when extraWidth is unspecified", () => {
  const { rerender } = render(
    <AutosizeInput value="1" type="number" onChange={() => {}} />
  );
  const input = screen.getByRole("spinbutton");
  expect(input.style.width).toBe("28px");
  rerender(
    <AutosizeInput value="1" type="number" extraWidth={0} onChange={() => {}} />
  );
  expect(input.style.width).toBe("12px");
  rerender(
    <AutosizeInput value="1" type="number" minWidth={40} onChange={() => {}} />
  );
  expect(input.style.width).toBe("40px");
});

it("keeps wrapper CSS separate and copies input typography when styles change", () => {
  const { container, rerender } = render(
    <AutosizeInput
      value="10"
      className="wrapper"
      style={{ padding: 3 }}
      inputClassName="field"
      inputStyle={{
        fontSize: 24,
        fontFamily: "serif",
        fontWeight: 700,
        letterSpacing: 2,
      }}
      onChange={() => {}}
    />
  );
  const input = screen.getByRole("textbox");
  expect(container.firstElementChild?.className).toBe("wrapper");
  expect(input.className).toBe("field");
  expect(input.style.padding).toBe("");
  const sizer = container.querySelector('[aria-hidden="true"]') as HTMLElement;
  expect(sizer.style.fontSize).toBe("24px");
  expect(sizer.style.fontFamily).toBe("serif");
  expect(sizer.style.fontWeight).toBe("700");
  expect(sizer.style.letterSpacing).toBe("2px");
  expect(sizer.style.whiteSpace).toBe("pre");
  rerender(
    <AutosizeInput
      value="10"
      inputStyle={{ fontSize: 32 }}
      onChange={() => {}}
    />
  );
  expect(sizer.style.fontSize).toBe("32px");
});

it("preserves decimal input, focus and selection during controlled sizing updates", async () => {
  const onChange = jest.fn();
  function Controlled() {
    const [value, setValue] = useState("");
    return (
      <AutosizeInput
        value={value}
        inputMode="decimal"
        onChange={(event) => {
          onChange(event.target.value);
          setValue(event.target.value);
        }}
      />
    );
  }
  render(<Controlled />);
  const input = screen.getByRole("textbox") as HTMLInputElement;
  await userEvent.type(input, "0.01");
  expect(input.getAttribute("inputmode")).toBe("decimal");
  expect(input.value).toBe("0.01");
  expect(onChange).toHaveBeenLastCalledWith("0.01");
  expect(document.activeElement).toBe(input);
  input.setSelectionRange(2, 2);
  act(() => {
    characterWidth = 20;
    window.dispatchEvent(new Event("resize"));
  });
  expect(input.style.width).toBe("82px");
  expect(input.selectionStart).toBe(2);
  expect(input.selectionEnd).toBe(2);
  expect(document.activeElement).toBe(input);
});

it("delivers native callback and object refs and clears them on unmount in StrictMode", () => {
  const callback = jest.fn();
  const object = createRef<HTMLInputElement>();
  const { rerender, unmount } = render(
    <StrictMode>
      <AutosizeInput value="1" inputRef={callback} onChange={() => {}} />
    </StrictMode>
  );
  const input = screen.getByRole("textbox");
  expect(callback).toHaveBeenLastCalledWith(input);
  rerender(
    <StrictMode>
      <AutosizeInput value="2" inputRef={object} onChange={() => {}} />
    </StrictMode>
  );
  expect(callback).toHaveBeenLastCalledWith(null);
  expect(object.current).toBe(input);
  object.current?.focus();
  expect(document.activeElement).toBe(input);
  unmount();
  expect(object.current).toBeNull();
});

it("supports the limit selector's state-setter ref without recreating the input", () => {
  function Selector() {
    const [input, setInput] = useState<HTMLInputElement | null>(null);
    return (
      <>
        <button onClick={() => input?.focus()}>Switch</button>
        <AutosizeInput
          value="99.999"
          inputRef={setInput}
          extraWidth={0}
          onChange={() => {}}
        />
      </>
    );
  }
  const { unmount } = render(<Selector />);
  fireEvent.click(screen.getByRole("button"));
  expect(document.activeElement).toBe(screen.getByRole("textbox"));
  unmount();
});

it("remeasures when initially loading fonts become ready", async () => {
  let resolveFonts!: () => void;
  const fonts = Object.assign(new EventTarget(), {
    ready: new Promise<void>((resolve) => {
      resolveFonts = resolve;
    }),
  });
  const original = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: fonts,
  });
  try {
    const { unmount } = render(
      <AutosizeInput value="12" onChange={() => {}} />
    );
    expect(screen.getByRole("textbox").style.width).toBe("22px");
    await act(async () => {
      characterWidth = 20;
      resolveFonts();
      await fonts.ready;
    });
    expect(screen.getByRole("textbox").style.width).toBe("42px");
    unmount();
  } finally {
    if (original) Object.defineProperty(document, "fonts", original);
    else Reflect.deleteProperty(document, "fonts");
  }
});

it("remeasures for late fonts and visibility changes and cleans up all listeners", async () => {
  let resolveFonts!: () => void;
  const fonts = Object.assign(new EventTarget(), {
    ready: new Promise<void>((resolve) => {
      resolveFonts = resolve;
    }),
  });
  const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts");
  const originalObserver = globalThis.ResizeObserver;
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: fonts,
  });
  const observe = jest.fn();
  const disconnect = jest.fn();
  let resize!: ResizeObserverCallback;
  globalThis.ResizeObserver = jest.fn().mockImplementation((callback) => {
    resize = callback;
    return { observe, disconnect };
  });
  const computedStyle = jest.spyOn(window, "getComputedStyle");
  const removeFontListener = jest.spyOn(fonts, "removeEventListener");
  const removeWindowListener = jest.spyOn(window, "removeEventListener");
  try {
    const { unmount } = render(
      <AutosizeInput value="12" onChange={() => {}} />
    );
    const input = screen.getByRole("textbox");
    expect(observe).toHaveBeenCalledWith(input);
    act(() => {
      characterWidth = 15;
      fonts.dispatchEvent(new Event("loadingdone"));
    });
    expect(input.style.width).toBe("32px");
    act(() => {
      characterWidth = 20;
      resize([], {} as ResizeObserver);
    });
    expect(input.style.width).toBe("42px");
    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(removeFontListener).toHaveBeenCalledWith(
      "loadingdone",
      expect.any(Function)
    );
    expect(removeWindowListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
    computedStyle.mockClear();
    await act(async () => {
      resolveFonts();
      fonts.dispatchEvent(new Event("loadingdone"));
      window.dispatchEvent(new Event("resize"));
      resize([], {} as ResizeObserver);
      await fonts.ready;
    });
    expect(computedStyle).not.toHaveBeenCalled();
  } finally {
    if (originalFonts) Object.defineProperty(document, "fonts", originalFonts);
    else Reflect.deleteProperty(document, "fonts");
    globalThis.ResizeObserver = originalObserver;
  }
});

it("InputBox autosize forwards decimal/placeholder/disabled props and resets focus on blur", async () => {
  const inputRef = { current: null as HTMLInputElement | null };
  const onInput = jest.fn();
  const onBlur = jest.fn();
  const props = {
    isAutosize: true,
    inputRef,
    onInput,
    onBlur,
    inputMode: "decimal" as const,
    placeholder: "0.00",
  };
  const { container, rerender, unmount } = render(
    <InputBox {...props} disabled />
  );
  const input = screen.getByRole("textbox") as HTMLInputElement;
  expect(inputRef.current).toBe(input);
  expect(input.disabled).toBe(true);
  expect(input.placeholder).toBe("0.00");
  expect(input.getAttribute("inputmode")).toBe("decimal");
  expect(input.style.width).toBe("42px");
  expect(container.querySelector("label")?.htmlFor).toBe(input.id);
  rerender(<InputBox {...props} />);
  await userEvent.type(input, "0.01");
  expect(onInput).toHaveBeenLastCalledWith("0.01");
  expect(input.value).toBe("0.01");
  expect(
    container.firstElementChild?.classList.contains("border-osmoverse-200")
  ).toBe(true);
  fireEvent.wheel(input);
  expect(onBlur).toHaveBeenCalledTimes(1);
  expect(
    container.firstElementChild?.classList.contains("border-osmoverse-200")
  ).toBe(false);
  unmount();
  expect(inputRef.current).toBeNull();
});
