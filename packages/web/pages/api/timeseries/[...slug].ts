import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  data: any;
};

const username = "admin";
const password = "admin";

const IMPERATOR_TIMESERIES_DEFAULT_BASEURL =
  "https://proxyapi.osmosis-labs.workers.dev";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // console.log("------------ timeseries start ---------------");
  // console.log("slug: ", req.query.slug);
  // console.log("query: ", req.query);
  // console.log("url: ", req.url);
  // console.log("------------ timeseries end ---------------");

  const queryString = req.url?.replace(/api\/timeseries\//, "");

  console.log("query string: ", queryString);

  const proxyUrl = `${IMPERATOR_TIMESERIES_DEFAULT_BASEURL}${queryString}`;

  try {
    const response = await axios.get(proxyUrl, {
      auth: {
        username: username,
        password: password,
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    const status = error?.response?.status || 500;
    const message = status === 404 ? "Not Found" : "Unexpected Error";
    return res.status(status).json({ message });
  }

  // .then((response) => {
  //   console.log(response.data);
  // })
  // .catch((error) => {
  //   console.error("Error making GET request:", error);
  // });

  // console.log("proxyUrl: ", proxyUrl);

  // res.status(200).json({ message: "Hello from Next.js!" });
}
