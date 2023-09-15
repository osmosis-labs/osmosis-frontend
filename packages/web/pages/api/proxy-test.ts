import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
/**
 * Broadcasts a transaction to the chain.
 *
 * We require this endpoint since many nodes do not have CORS enabled. Without CORS,
 * a node is unable to interact directly with browsers unless it's updated to incorporate
 * the CORS headers. Therefore, by having this endpoint, we can ensure that
 * users can still broadcast their transactions to the network.
 */
export default async function handler(
  // @ts-ignore
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://proxy-api.osmosis.zone/stream/pool/v1/all?min_liquidity=1000&order_key=liquidity&order_by=desc&offset=0&limit=200",
      headers: {
        Authorization:
          "Basic b3Ntb3Npc2ZlOk5ESkxVMFJ5Ym1VemF6SXNkZmxrandlcldFRm4=",
      },
    };

    const result = await axios
      .request(config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });

    console.log("result: ", result);

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({
      message: "An unexpected error occurred. Please try again.",
    });
  }
}
