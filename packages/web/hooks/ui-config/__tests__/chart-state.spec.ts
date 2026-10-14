import {
  createValueStore,
  INITIAL_ZOOM,
  zoomedIn,
  zoomedOut,
} from "../chart-state";

describe("zoom helpers", () => {
  it("zooms out in steps and in down to a floor of 1", () => {
    expect(zoomedOut(INITIAL_ZOOM)).toBeCloseTo(1.1);
    expect(zoomedIn(INITIAL_ZOOM)).toBeCloseTo(1);
    expect(zoomedIn(1)).toBe(1);
    expect(zoomedIn(1.02)).toBe(1);
  });
});

describe("createValueStore", () => {
  it("notifies subscribers only on change and supports unsubscribe", () => {
    const store = createValueStore(1);
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    store.set(1);
    expect(listener).not.toHaveBeenCalled();

    store.set(2);
    expect(store.get()).toBe(2);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.set(3);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("uses a custom equality check", () => {
    const store = createValueStore({ a: 1 }, (x, y) => x.a === y.a);
    const listener = jest.fn();
    store.subscribe(listener);

    store.set({ a: 1 });
    expect(listener).not.toHaveBeenCalled();
    store.set({ a: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
