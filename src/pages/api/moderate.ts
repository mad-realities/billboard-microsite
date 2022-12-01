import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end("Method Not Allowed");
  } else if (req.method === "POST") {
    try {
      const { instagramHandle, apiSecret } = req.body;
      if (apiSecret !== process.env.API_SECRET) {
        res.status(401).end("Unauthorized");
      } else if (!instagramHandle) {
        res.status(400).end("Bad Request, missing communityId or instagramHandle");
      } else {
        const shadowBan = await prisma.shadowBanList.create({
          data: {
            instagramHandle,
          },
        });
        res.status(200).json(shadowBan);
      }
    } catch {
      res.status(500).end("Server Error");
    }
  } else {
    try {
      const { apiSecret } = req.query;
      if (apiSecret !== process.env.API_SECRET) {
        res.status(401).end("Unauthorized");
      } else {
        const shadowBans = await prisma.shadowBanList.findMany();
        const handles = shadowBans.map((shadowBan) => shadowBan.instagramHandle);
        res.status(200).json({ shadowBans: handles });
      }
    } catch {
      res.status(500).end("Server Error");
    }
  }
};

export default handler;
