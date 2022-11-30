import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma";

export const loadRank = async (offset: number, limit: number) => {
  // exclude instagram handles that are in the shadow ban list
  const shadowBans = await prisma.shadowBanList.findMany();
  const shadowBanHandles = shadowBans.map((shadowBan) => shadowBan.instagramHandle);

  // get most recent votes for each community id
  const votes = await prisma.vote.findMany({
    where: {
      communityId: {
        notIn: shadowBanHandles,
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  // get the most recent vote for each community id
  const communityIds = new Set();
  const mostRecentVotes = [];
  for (const vote of votes) {
    if (!communityIds.has(vote.communityId)) {
      communityIds.add(vote.communityId);
      mostRecentVotes.push(vote);
    }
  }

  // convert most recent votes to a sorted list with rank and instagram handle
  const voteCounts = mostRecentVotes.reduce((acc, vote) => {
    if (acc[vote.instagramHandle]) {
      acc[vote.instagramHandle].count += 1;
    } else {
      acc[vote.instagramHandle] = {
        count: 1,
        instagramHandle: vote.instagramHandle,
      };
    }
    return acc;
  }, {} as { [key: string]: { count: number; instagramHandle: string } });

  // sort vote counts by count and instagram handle
  const sortedVoteCounts = Object.values(voteCounts).sort((a, b) => {
    if (a.count > b.count) {
      return -1;
    } else if (a.count < b.count) {
      return 1;
    } else {
      if (a.instagramHandle < b.instagramHandle) {
        return -1;
      } else if (a.instagramHandle > b.instagramHandle) {
        return 1;
      } else {
        return 0;
      }
    }
  });

  // convert voteCounts to a list with rank and instagram handle
  const results = sortedVoteCounts.map((voteCount, index) => {
    return {
      rank: offset + index + 1,
      instagramHandle: voteCount.instagramHandle,
    };
  });

  // get the slice of results we want
  return results.slice(offset, offset + limit);
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
