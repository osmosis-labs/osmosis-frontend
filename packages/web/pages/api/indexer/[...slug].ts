import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  message: string;
};

const IMPERATOR_INDEXER_DEFAULT_BASEURL = "https://proxy-indexer.osmosis.zone";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // console.log("------------ indexer start ---------------");
  // console.log("slug: ", req.query.slug);
  // console.log("query: ", req.query);
  // console.log("url: ", req.url);
  // console.log("------------ indexer end ---------------");
  res.status(200).json({ message: "Hello from Next.js!" });
}
