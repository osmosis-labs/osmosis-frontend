import { apiClient, ClientOptions } from "./api-client";

/**
 * Configuration for a single endpoint.
 * Endpoints with higher priority are tried first.
 */
export interface EndpointConfig {
  address: string;
  priority?: number;
}

/**
 * Options for configuring multi-endpoint client behavior.
 */
export interface MultiEndpointOptions {
  /** Maximum number of retries per endpoint before trying the next one.
   * Default: 3 */
  maxRetries?: number;
  /** Request timeout in milliseconds. Default: 5000ms */
  timeout?: number;
  /** Multiplier for exponential backoff delay. Default: 2 (100ms, 200ms, 400ms...) */
  backoffMultiplier?: number;
}

/**
 * HTTP client that supports multiple endpoints with automatic failover and retry logic.
 *
 * Features:
 * - Tries endpoints in priority order (higher priority first)
 * - Retries each endpoint with exponential backoff
 * - Remembers the last successful endpoint for future requests
 * - Provides comprehensive error messages when all endpoints fail
 *
 * Example usage:
 * ```typescript
 * const client = createMultiEndpointClient([
 *   { address: "https://rpc-osmosis.blockapsis.com", priority: 1 },
 *   { address: "https://osmosis-rpc.polkachu.com", priority: 0 },
 * ]);
 *
 * const status = await client.fetch<StatusResponse>("/status");
 * ```
 */
export class MultiEndpointClient {
  private endpoints: EndpointConfig[];
  private currentIndex: number = 0;
  private maxRetries: number;
  private timeout: number;
  private backoffMultiplier: number;

  constructor(
    endpoints: EndpointConfig[],
    options: MultiEndpointOptions = {}
  ) {
    if (!endpoints || endpoints.length === 0) {
      throw new Error("At least one endpoint must be provided");
    }

    // Sort by priority (higher priority first)
    this.endpoints = [...endpoints].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );

    this.maxRetries = options.maxRetries ?? 3;
    this.timeout = options.timeout ?? 5000;
    this.backoffMultiplier = options.backoffMultiplier ?? 2;
  }

  /**
   * Fetch data from the given path using multi-endpoint retry logic.
   *
   * @param path - The path to append to the endpoint URL (e.g., "/status")
   * @param options - Additional fetch options (headers, body, etc.)
   * @returns Promise resolving to the typed response
   * @throws Error if all endpoints fail after all retries
   */
  async fetch<T>(path: string, options?: ClientOptions): Promise<T> {
    let lastError: Error | null = null;

    // Try each endpoint starting from the last successful one
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpointIndex = (this.currentIndex + i) % this.endpoints.length;
      const endpoint = this.endpoints[endpointIndex];

      // Retry current endpoint with exponential backoff
      for (let retry = 0; retry < this.maxRetries; retry++) {
        try {
          const url = `${endpoint.address}${path}`;

          // AbortSignal.timeout is only available in Node 17.3+ and modern browsers
          const timeoutSignal =
            typeof AbortSignal.timeout === "function"
              ? AbortSignal.timeout(this.timeout)
              : undefined;

          const result = await apiClient<T>(url, {
            ...options,
            ...(timeoutSignal && { signal: timeoutSignal }),
          });

          // Success! Remember this endpoint for future requests
          this.currentIndex = endpointIndex;
          return result;
        } catch (error) {
          lastError = error as Error;

          // Log the failure for debugging
          if (retry === this.maxRetries - 1) {
            console.warn(
              `[MultiEndpointClient] Endpoint ${endpoint.address} failed after ${this.maxRetries} retries. ` +
                (i < this.endpoints.length - 1
                  ? "Trying next endpoint..."
                  : "No more endpoints available."),
              lastError.message
            );
          }

          // Wait before retry with exponential backoff
          // Don't wait on the last retry if there are more endpoints to try
          if (retry < this.maxRetries - 1) {
            const backoffDelay = Math.pow(this.backoffMultiplier, retry) * 100;
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          }
        }
      }
    }

    // All endpoints exhausted
    throw new Error(
      `All ${this.endpoints.length} endpoints failed after ${this.maxRetries} retries each. ` +
        `Last error: ${lastError?.message || "Unknown error"}`
    );
  }

  /**
   * Get the current best endpoint address.
   * Useful for direct access when needed.
   */
  getCurrentEndpoint(): string {
    return this.endpoints[this.currentIndex].address;
  }

  /**
   * Get all configured endpoints.
   */
  getEndpoints(): EndpointConfig[] {
    return [...this.endpoints];
  }
}

/**
 * Factory function to create a MultiEndpointClient instance.
 *
 * @param endpoints - Array of endpoint configurations
 * @param options - Optional configuration for retry behavior
 * @returns A new MultiEndpointClient instance
 *
 * @example
 * ```typescript
 * const client = createMultiEndpointClient(
 *   chain.apis.rpc,
 *   { maxRetries: 5, timeout: 10000 }
 * );
 * ```
 */
export function createMultiEndpointClient(
  endpoints: EndpointConfig[] | { address: string }[],
  options?: MultiEndpointOptions
): MultiEndpointClient {
  return new MultiEndpointClient(endpoints, options);
}
