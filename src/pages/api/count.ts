import { NextApiRequest, NextApiResponse } from "next";
import { loadRank } from "./rank";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Method Not Allowed");
  } else {
    try {
      const { apiSecret, offset, limit } = req.query;
      if (apiSecret !== process.env.COUNT_SECRET) {
        res.status(401).end("Unauthorized");
      } else {
        const offsetNum = parseInt(offset as string) || 0;
        const limitNum = parseInt(limit as string) || 10;
        const results = await loadRank(offsetNum, limitNum, true);
        res.json({ results });
      }
    } catch {
      res.status(500).end("Server Error");
    }
  }
};

export default handler;
