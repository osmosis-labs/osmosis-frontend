const { execFileSync } = require("node:child_process");
const {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} = require("@testing-library/react");
const React = require("react");
const FocusTrap = require("focus-trap-react");
const ReactModal = require("react-modal");

const h = React.createElement;
const tippyEntries = [
  "@tippyjs/react",
  "@tippyjs/react/dist/tippy-react.umd.min.js",
  "@tippyjs/react/headless",
  "@tippyjs/react/headless/dist/tippy-react-headless.umd.min.js",
];

// Keep the dependency contract tests independent of application config and mocks
// so the same file can also run against an isolated React 19 installation.
afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe.each(tippyEntries)("%s ref compatibility", (entry) => {
  const { default: Tippy } = require(entry);
  const extraProps = entry.includes("headless")
    ? { render: () => h("div", { role: "tooltip" }, "Tip") }
    : {};

  test.each(["object", "callback"])(
    "preserves %s child and forwarded refs, without ref-access warnings",
    (kind) => {
      const errors = jest.spyOn(console, "error");
      const warnings = jest.spyOn(console, "warn");
      const childRef = kind === "object" ? React.createRef() : jest.fn();
      const forwardedRef = kind === "object" ? React.createRef() : jest.fn();
      const Button = React.forwardRef((props, ref) =>
        h("button", { ...props, ref })
      );
      const view = render(
        h(
          Tippy,
          { ...extraProps, content: "Tip", ref: forwardedRef, duration: 0 },
          h(Button, { ref: childRef }, "Trigger")
        )
      );
      const button = screen.getByRole("button", { name: "Trigger" });
      const instance = button._tippy;
      if (kind === "object") {
        expect(childRef.current).toBe(button);
        expect(forwardedRef.current).toBe(button);
      } else {
        expect(childRef).toHaveBeenLastCalledWith(button);
        expect(forwardedRef).toHaveBeenLastCalledWith(button);
      }
      view.unmount();
      expect(instance.state.isDestroyed).toBe(true);
      if (kind === "object") {
        expect(childRef.current).toBeNull();
        expect(forwardedRef.current).toBeNull();
      } else {
        expect(childRef).toHaveBeenLastCalledWith(null);
        expect(forwardedRef).toHaveBeenLastCalledWith(null);
      }
      // Spies pass through: warnings aren't suppressed to make the tests pass.
      expect(errors).not.toHaveBeenCalled();
      expect(warnings).not.toHaveBeenCalled();
      errors.mockRestore();
      warnings.mockRestore();
    }
  );

  test("renders the trigger on the server without DOM globals", () => {
    const output = execFileSync(
      process.execPath,
      [
        "-e",
        `const React = require(${JSON.stringify(require.resolve("react"))});
         const {renderToString} = require(${JSON.stringify(require.resolve("react-dom/server"))});
         const Tippy = require(${JSON.stringify(require.resolve(entry))}).default;
         process.stdout.write(renderToString(React.createElement(Tippy,
           {content: 'Tip'}, React.createElement('button', null, 'Trigger'))));`,
      ],
      { encoding: "utf8" }
    );
    expect(output).toBe("<button>Trigger</button>");
  });
});

test("tooltip singleton switches content and removes unmounted targets", async () => {
  const { default: Tippy, useSingleton } = require("@tippyjs/react");
  let source;
  function Tooltips({ second }) {
    const [singletonSource, target] = useSingleton();
    source = singletonSource;
    return h(
      React.Fragment,
      null,
      h(Tippy, { singleton: source, content: "", duration: 0 }),
      h(
        Tippy,
        { singleton: target, content: "First tip" },
        h("button", null, "First")
      ),
      second &&
        h(
          Tippy,
          { singleton: target, content: "Second tip" },
          h("button", null, "Second")
        )
    );
  }
  const view = render(h(Tooltips, { second: true }));
  const singleton = source.data.instance;
  fireEvent.mouseEnter(screen.getByRole("button", { name: "First" }));
  await waitFor(() => expect(singleton.popper.textContent).toBe("First tip"));
  fireEvent.mouseEnter(screen.getByRole("button", { name: "Second" }));
  await waitFor(() => expect(singleton.popper.textContent).toBe("Second tip"));
  view.rerender(h(Tooltips, { second: false }));
  expect(source.data.children).toHaveLength(1);
  view.unmount();
  expect(singleton.state.isDestroyed).toBe(true);
});

test("drawer focus trap forwards its ref, cycles focus, ignores Escape and returns focus", async () => {
  const errors = jest.spyOn(console, "error");
  const opener = document.createElement("button");
  document.body.appendChild(opener);
  opener.focus();
  const childRef = React.createRef();
  const trap = (active) =>
    h(
      FocusTrap,
      {
        active,
        focusTrapOptions: {
          allowOutsideClick: true,
          escapeDeactivates: false,
          // jsdom doesn't implement layout; don't change production options.
          tabbableOptions: { displayCheck: "none" },
        },
      },
      h(
        "div",
        { ref: childRef },
        h("button", null, "First"),
        h("button", null, "Last")
      )
    );
  const view = render(trap(true));
  const first = screen.getByRole("button", { name: "First" });
  const last = screen.getByRole("button", { name: "Last" });
  expect(childRef.current).toContainElement(first);
  await waitFor(() => expect(document.activeElement).toBe(first));
  last.focus();
  fireEvent.keyDown(last, { key: "Tab", keyCode: 9 });
  expect(document.activeElement).toBe(first);
  fireEvent.keyDown(first, { key: "Tab", keyCode: 9, shiftKey: true });
  expect(document.activeElement).toBe(last);
  fireEvent.keyDown(last, { key: "Escape", keyCode: 27 });
  opener.focus();
  expect(document.activeElement).toBe(last);
  view.rerender(trap(false));
  await waitFor(() => expect(document.activeElement).toBe(opener));
  view.unmount();
  expect(childRef.current).toBeNull();
  opener.remove();
  expect(errors).not.toHaveBeenCalled();
  errors.mockRestore();
});

test("modal retains dialog semantics, Escape close, close delay and focus return", async () => {
  const app = document.createElement("div");
  const opener = document.createElement("button");
  app.appendChild(opener);
  document.body.appendChild(app);
  ReactModal.setAppElement(app);
  opener.focus();
  const onRequestClose = jest.fn();
  const onAfterClose = jest.fn();
  const modal = (isOpen) =>
    h(
      ReactModal,
      {
        isOpen,
        onRequestClose,
        onAfterClose,
        closeTimeoutMS: 150,
        contentLabel: "Test dialog",
      },
      h("button", null, "Inside")
    );
  const view = render(modal(true));
  const dialog = screen.getByRole("dialog", { name: "Test dialog" });
  expect(app).toHaveAttribute("aria-hidden", "true");
  expect(document.activeElement).toBe(dialog);
  fireEvent.keyDown(dialog, { key: "Escape", keyCode: 27 });
  expect(onRequestClose).toHaveBeenCalledTimes(1);
  view.rerender(modal(false));
  expect(onAfterClose).not.toHaveBeenCalled();
  expect(dialog).toBeInTheDocument();
  await waitFor(() => expect(onAfterClose).toHaveBeenCalledTimes(1));
  expect(app).not.toHaveAttribute("aria-hidden");
  expect(document.activeElement).toBe(opener);
  view.unmount();
  app.remove();
});
