/* eslint-disable import/no-extraneous-dependencies */
import { superjson } from "@osmosis-labs/server";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const server = setupServer();

export function trpcQuery<T>(procedure: string, getData: () => T) {
  return http.get(`http://localhost:3000/trpc/${procedure}`, () =>
    HttpResponse.json({ result: { data: superjson.serialize(getData()) } })
  );
}
