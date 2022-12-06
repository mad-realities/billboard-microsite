import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/prisma";
import { Vote } from "@prisma/client";

export const loadRankForHandle = async (handle: string) => {
  const results = await loadRank(0, 10000);
  return results.find((result) => result.instagramHandle === handle);
};

const consolidateVotes = (votes: Vote[]) => {
  const seenVoteTuples = new Set();
  const trueVotes = [];
  for (const vote of votes) {
    const key = `${vote.communityId}\t${vote.instagramHandle}`;
    if (!seenVoteTuples.has(key)) {
      seenVoteTuples.add(key);
      trueVotes.push(vote);
    }
  }
  return trueVotes;
};

const countVotes = (votes: Vote[]) => {
  return votes.reduce((acc, vote) => {
    if (acc[vote.instagramHandle]) {
      acc[vote.instagramHandle] += 1;
    } else {
      acc[vote.instagramHandle] = 1;
    }
    return acc;
  }, {} as { [key: string]: number });
};

const sortVoteCounts = (voteCounts: { [key: string]: number }) => {
  return Object.entries(voteCounts).sort((a, b) => {
    if (a[1] > b[1]) {
      return -1;
    } else if (a[1] < b[1]) {
      return 1;
    } else {
      if (a[0] < b[0]) {
        return -1;
      } else if (a[0] > b[0]) {
        return 1;
      } else {
        return 0;
      }
    }
  });
};

const counterDifference = (counter1: { [key: string]: number }, counter2: { [key: string]: number }) => {
  const difference: { [key: string]: number } = {};
  for (const key in counter1) {
    if (key in counter2) {
      difference[key] = counter1[key] - counter2[key];
    } else {
      difference[key] = counter1[key];
    }
  }
  return difference;
};

const strictCounterDifference = (counter1: { [key: string]: number }, counter2: { [key: string]: number }) => {
  const difference: { [key: string]: number | null } = {};
  for (const key in counter1) {
    if (key in counter2) {
      difference[key] = counter1[key] - counter2[key];
    } else {
      difference[key] = null;
    }
  }
  return difference;
};

const generateRanks = (sortedVoteCounts: [string, number][]) => {
  return sortedVoteCounts.reduce((acc, [instagramHandle, voteCount], index) => {
    acc[instagramHandle] = index + 1;
    return acc;
  }, {} as { [key: string]: number });
};

const generateRankDirectionDescriptor = (rankDelta: number | null) => {
  if (rankDelta === null) {
    return "NEW";
  } else if (rankDelta > 0) {
    return "DOWN";
  } else if (rankDelta < 0) {
    return "UP";
  } else {
    return "SAME";
  }
};

export const loadRank = async (offset: number, limit: number, includeCount?: boolean) => {
  // exclude instagram handles that are in the shadow ban list
  const shadowBans = await prisma.shadowBanList.findMany();
  const shadowBanHandles = shadowBans.map((shadowBan) => shadowBan.instagramHandle);

  const allVotes = await prisma.vote.findMany({
    where: {
      communityId: {
        notIn: shadowBanHandles,
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  const latestScriptRun = (
    await prisma.scriptRun.findMany({
      orderBy: {
        timestamp: "desc",
      },
    })
  )[11];

  const newVotes = await prisma.vote.findMany({
    where: {
      communityId: {
        notIn: shadowBanHandles,
      },
      timestamp: {
        gte: latestScriptRun?.timestamp,
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  const newVoteCounts = countVotes(consolidateVotes(allVotes));
  const voteCountDelta = countVotes(consolidateVotes(newVotes));
  const oldVoteCounts = counterDifference(newVoteCounts, voteCountDelta);
  const newRanks = generateRanks(sortVoteCounts(newVoteCounts));
  const oldRanks = generateRanks(sortVoteCounts(oldVoteCounts));
  const rankDelta = strictCounterDifference(newRanks, oldRanks);

  const results = Object.entries(newVoteCounts)
    .map(([instagramHandle, newVoteCount]) => {
      const rankDirection = generateRankDirectionDescriptor(rankDelta[instagramHandle]);
      const finalRankDirection = rankDirection === "DOWN" && newRanks[instagramHandle] > 50 ? "SAME" : rankDirection;

      return {
        instagramHandle,
        rank: newRanks[instagramHandle],
        rankDirection: finalRankDirection,
        ...(includeCount && { count: newVoteCount }),
      };
    })
    .sort((e1, e2) => (e1.rank < e2.rank ? -1 : e1.rank > e2.rank ? 1 : 0));

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
