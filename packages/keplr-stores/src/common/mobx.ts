// Adapted from mobx-state-tree via @keplr-wallet/common@0.10.24 (Apache-2.0).

/**
 * Wraps a promise in a generator so `yield*` inside a MobX `flow` keeps the
 * promise's resolved type: `const value = yield* toGenerator(fetchNumber())`.
 */
export function* toGenerator<T>(p: Promise<T>): Generator<Promise<T>, T> {
  return (yield p) as T;
}
