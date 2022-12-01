import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
  } else {
    try {
      const { communityId, instagramHandle, apiSecret } = req.body;
      if (apiSecret !== process.env.API_SECRET) {
        res.status(401).end("Unauthorized");
      } else if (!communityId || !instagramHandle) {
        res.status(400).end("Bad Request, missing communityId or instagramHandle");
      } else {
        const vote = await prisma.vote.create({
          data: {
            communityId,
            instagramHandle,
          },
        });
        res.status(200).json(vote);
      }
    } catch {
      res.status(500).end("Server Error");
    }
  }
};

export default handler;
