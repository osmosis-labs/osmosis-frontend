// eslint-disable-next-line import/no-extraneous-dependencies
const JSDOMEnvironment = require("jest-environment-jsdom").default;
const { Blob, File } = require("node:buffer");

/**
 *
 * This is a superset of the JSDOM environment for Jest that respects Node.js globals.
 * It extends JSDOM environment to include what we need to run our tests.
 */
class JSDOMEnvironmentExtended extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    this.global.ReadableStream = ReadableStream;
    this.global.TextDecoder = TextDecoder;
    this.global.TextEncoder = TextEncoder;

    this.global.Blob = Blob;
    this.global.File = File;
    this.global.Headers = Headers;
    this.global.FormData = FormData;
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.Request = Request;
    this.global.Response = Response;
    Object.defineProperty(this.global, "fetch", {
      value: fetch,
      writable: true,
    });
    this.global.structuredClone = structuredClone;
  }
}

module.exports = JSDOMEnvironmentExtended;
