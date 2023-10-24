export enum HTTPMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export interface ClientErrorResponse {
  message: string;
  error: Error;
}

export interface ApiClientError<Data = unknown> {
  data: Data;
  response: Response;
}

interface ClientOptions extends RequestInit {
  data?: Record<string, any>;
}

const UNEXPECTED_ERROR_MESSAGE = "An unexpected error occurred.";

export async function apiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, ...customConfig }: ClientOptions = {}
): Promise<T> {
  const config: RequestInit = {
    method: data ? HTTPMethod.POST : HTTPMethod.GET,
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      ...(data && { "Content-Type": "application/json" }),
      ...customHeaders,
    },
    ...customConfig,
  };

  return fetch(endpoint, config).then(async (response) => {
    try {
      const data = await response.json();

      if (response.ok) {
        // Cosmos chains return a code if there's an error
        if ("code" in data && Boolean(data.code)) {
          throw new Error(`JSON deserialization failed ${data.code}`);
        }

        return data;
      } else {
        return Promise.reject({ data, response });
      }
    } catch (e) {
      const error = e as Error;

      const message =
        error.message === "Unexpected token < in JSON at position 0"
          ? UNEXPECTED_ERROR_MESSAGE
          : error.message;

      const newError = new Error(message);

      // @ts-ignore
      newError["status"] = response.status;

      return Promise.reject({
        message: error.message,
        error,
      });
    }
  });
}
