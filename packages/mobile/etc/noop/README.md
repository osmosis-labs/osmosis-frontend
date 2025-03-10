# Noop

This is copied as a design pattern from Keplr-wallet!

https://github.com/chainapsis/keplr-wallet/tree/v0.12.25/etc/noop

> This directory isn’t actually used, and would be preferred to not be added. But it is needed to explicitly ignore specific libraries used by the dependency. Specifically, libsodium isn’t actually used and WebAssembly can’t be used in the extension’s sandbox environment but creates various errors so the directory exists to ignore libsodium.
