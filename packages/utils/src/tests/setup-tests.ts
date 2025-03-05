// eslint-disable-next-line import/no-extraneous-dependencies
import "whatwg-fetch";

// Mock TextEncoder and TextDecoder for Jest tests
if (typeof global.TextEncoder === "undefined") {
  // Simple mock implementation of TextEncoder
  class MockTextEncoder {
    encode(input?: string): Uint8Array {
      const str = input || "";
      const length = str.length;
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = str.charCodeAt(i) & 0xff;
      }
      return bytes;
    }
  }

  // Simple mock implementation of TextDecoder
  class MockTextDecoder {
    decode(input?: Uint8Array): string {
      if (!input) return "";
      return String.fromCharCode.apply(null, Array.from(input));
    }
  }

  global.TextEncoder = MockTextEncoder as any;
  global.TextDecoder = MockTextDecoder as any;
}
