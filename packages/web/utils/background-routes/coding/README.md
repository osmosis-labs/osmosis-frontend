# Background Routes Coding

Message passing between the main thread and web worker rely on structured clone in [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm): there's certain parameters and return types of the router that are not compatible with that method. Namely, the instances of `RoutablePool`, Function types found in various places, Keplr unit type class instances, and likely others.

We need to handle cloning of data the router needs and returns ourselves, given the assumptions we can make with the data we are passing.
