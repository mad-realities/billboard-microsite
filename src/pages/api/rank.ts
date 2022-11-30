import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma";

export const loadRank = async (offset: number, limit: number) => {
  // exclude instagram handles that are in the shadow ban list
  const shadowBans = await prisma.shadowBanList.findMany();
  const shadowBanHandles = shadowBans.map((shadowBan) => shadowBan.instagramHandle);

  const voteCounts = await prisma.vote.groupBy({
    by: ["instagramHandle"],
    _count: {
      instagramHandle: true,
    },
    orderBy: [
      {
        _count: {
          instagramHandle: "desc",
        },
      },
      {
        instagramHandle: "desc",
      },
    ],
    take: limit,
    skip: offset,
    where: {
      instagramHandle: {
        notIn: shadowBanHandles,
      },
    },
  });

  // convert voteCounts to a list with rank and instagram handle
  const results = voteCounts.map((voteCount, index) => {
    return {
      rank: offset + index + 1,
      instagramHandle: voteCount.instagramHandle,
    };
  });

  return results;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Method Not Allowed");
  } else {
    try {
      const { offset, limit } = req.query;
      const offsetNum = parseInt(offset as string) || 0;
      const limitNum = parseInt(limit as string) || 10;
      const results = await loadRank(offsetNum, limitNum);
      res.json({ results });
    } catch {
      res.status(500).end("Server Error");
    }
  }
};

export default handler;
