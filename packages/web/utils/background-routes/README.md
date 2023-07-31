# Background Router

This is an implementation of the router interface that uses a single web worker to delegate the routing search problem to a background thread, thus unblocking UI updates on main thread.

How: a singleton worker thread is spawned. If the router params are updated (such as new pools), the worker thread is sent those new params and the router is reconstructed in the worker thread (thus freeing the cache in the old router instance). This maintains the same behavior as the `OptimizedRoutes` router, therefore allowing it to be a drop in replacement.

Messages are sent via `postMessage` calls, and received via event listeners. To maintain the same Promise-based API expected by the routing interface, the `BackgroundRoutes` object observes a pool of received responses after each message is sent, and uses those to resolve each Promise. Messages are encoded and decoded within the `BackgroundRouter` and the worker script to meet the needs of structured clone, a richer JS-native encoding/decoding method used by web workers.
