import { Leaderboard } from "@prisma/client";
import { prisma } from "./db";
import { Vote, VoteWithoutLeaderboard } from "./vote";

export async function assertLeaderboardConstraint() {
  const response = await prisma.leaderboard.findMany();
  const validLboards: Leaderboard[] = [];

  // find overlapping leaderboards
  for (const i in response) {
    const leaderboard = response[i];
    const start = new Date(leaderboard.startTime);
    const end = new Date(leaderboard.endTime);

    if (start > end) {
      throw new Error(`Leaderboard ${leaderboard.id} has an invalid start and end time`);
    }

    const overlappingLeaderboard = validLboards.find((lboard) => {
      const lboardStart = new Date(lboard.startTime);
      const lboardEnd = new Date(lboard.endTime);

      if ((start >= lboardStart && start <= lboardEnd) || (end >= lboardStart && end <= lboardEnd)) {
        return true;
      }
      return false;
    });

    if (overlappingLeaderboard) {
      throw new Error(`Leaderboard ${leaderboard.id} overlaps with leaderboard ${overlappingLeaderboard.id}`);
    } else {
      validLboards.push(leaderboard);
    }
  }

  return true;
}

export async function getLeaderboardVotes(votesWithoutLeaderboard: VoteWithoutLeaderboard[]) {
  const leaderboards = await prisma.leaderboard.findMany();
  const votes: Vote[] = [];
  const noLeaderboardVotes: VoteWithoutLeaderboard[] = [];

  votesWithoutLeaderboard.forEach((vote) => {
    const leaderboard = leaderboards.find((lboard) => {
      const start = new Date(lboard.startTime);
      const end = new Date(lboard.endTime);
      const timestamp = new Date(vote.timestamp);

      if (timestamp >= start && timestamp <= end) {
        return true;
      }
      return false;
    });

    if (leaderboard) {
      votes.push({
        ...vote,
        leaderboardId: leaderboard.id,
      });
    } else {
      noLeaderboardVotes.push(vote);
    }
  });

  return { votes, noLeaderboardVotes };
}

async function main() {
  await assertLeaderboardConstraint();
}

main();
