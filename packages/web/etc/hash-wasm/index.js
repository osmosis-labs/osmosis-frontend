"use strict";

// Stand-in for hash-wasm (~80KB gzipped of inlined WASM in the Worker). Its only consumer is
// @cosmjs/crypto's argon2id, used to encrypt serialized HD wallets, which this app never does.
// The client build already stubs the same CosmJS module (see next.config.js); root
// `resolutions` extend that to the server, where @cosmjs/crypto loads from node_modules.

exports.argon2id = async function argon2id() {
  throw new Error("argon2id is not available in this build");
};
