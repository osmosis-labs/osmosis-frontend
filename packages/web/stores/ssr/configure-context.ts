import { GetServerSidePropsContext } from "next";
import { duration } from "dayjs";

export function configureContext(
  context: GetServerSidePropsContext,
  cacheAge = duration({ seconds: 10 }),
  cacheRevalidate = duration({ seconds: 59 })
) {
  context.res.setHeader(
    "Cache-Control",
    `public, s-maxage=${cacheAge.asSeconds()}, stale-while-revalidate=${cacheRevalidate.asSeconds()}`
  );
}
