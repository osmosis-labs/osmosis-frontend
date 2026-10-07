import { act, render, screen } from "@testing-library/react";
import {
  getObserverTree,
  observable,
  onBecomeObserved,
  runInAction,
} from "mobx";
import { enableStaticRendering, observer } from "mobx-react-lite";
import { createContext, StrictMode, useContext } from "react";
import { renderToString } from "react-dom/server";

afterEach(() => enableStaticRendering(false));

describe("MobX observer lifecycle", () => {
  it("reacts to an observable supplied through a stable context provider", () => {
    const store = observable({ count: 0 });
    const Context = createContext(store);
    const Counter = observer(function Counter() {
      return <span>{useContext(Context).count}</span>;
    });
    render(
      <StrictMode>
        <Context.Provider value={store}>
          <Counter />
        </Context.Provider>
      </StrictMode>
    );
    expect(screen.getByText("0")).toBeTruthy();
    act(() => runInAction(() => store.count++));
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("disposes the committed observer subscription on unmount", () => {
    const store = observable({ count: 0 });
    const rendered = jest.fn();
    const Counter = observer(function Counter() {
      rendered(store.count);
      return <span>{store.count}</span>;
    });
    // React 18 StrictMode also abandons a render whose reaction is finalized
    // asynchronously by MobX. Assert immediate disposal for a committed render.
    const { unmount } = render(<Counter />);
    expect(getObserverTree(store, "count").observers).toHaveLength(1);
    act(() => runInAction(() => store.count++));
    expect(screen.getByText("1")).toBeTruthy();
    unmount();
    expect(getObserverTree(store, "count").observers).toBeUndefined();
    rendered.mockClear();
    act(() => runInAction(() => store.count++));
    expect(rendered).not.toHaveBeenCalled();
  });

  it("renders SSR snapshots without subscriptions when static rendering is enabled", () => {
    const store = observable({ count: 0 });
    // Wrap before enabling static rendering, like components imported by _app.
    const Counter = observer(() => <span>{store.count}</span>);
    const becameObserved = jest.fn();
    const dispose = onBecomeObserved(store, "count", becameObserved);
    try {
      enableStaticRendering(true);
      expect(renderToString(<Counter />)).toBe("<span>0</span>");
      runInAction(() => store.count++);
      expect(renderToString(<Counter />)).toBe("<span>1</span>");
      expect(becameObserved).not.toHaveBeenCalled();
      expect(getObserverTree(store, "count").observers).toBeUndefined();
    } finally {
      dispose();
      enableStaticRendering(false);
    }
    // The client is still reactive after the server/static path is disabled.
    render(<Counter />);
    act(() => runInAction(() => store.count++));
    expect(screen.getByText("2")).toBeTruthy();
  });
});
