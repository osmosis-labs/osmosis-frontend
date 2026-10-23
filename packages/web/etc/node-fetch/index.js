"use strict";

// node-fetch v2's CommonJS API on top of the platform fetch (Node 18+, browsers, Workers).
// Root `resolutions` point every `node-fetch` here, so cross-fetch and @solana/web3.js stop
// shipping node-fetch's WHATWG URL and encoding polyfills (whatwg-url, tr46, iconv-lite).
// Options only node-fetch understands, such as `agent`, are ignored.

class FetchError extends Error {
  constructor(message, type, systemError) {
    super(message);
    this.name = "FetchError";
    this.type = type;
    if (systemError) this.code = this.errno = systemError.code;
  }
}

class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = "AbortError";
    this.type = "aborted";
  }
}

function fetch(input, init) {
  return globalThis.fetch(input, init);
}

module.exports = exports = fetch;
exports.default = exports;
exports.Headers = globalThis.Headers;
exports.Request = globalThis.Request;
exports.Response = globalThis.Response;
exports.FetchError = FetchError;
exports.AbortError = AbortError;
