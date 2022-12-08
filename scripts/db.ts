import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { FIRST_LEADERBOARD_ID } from "./constants";
import { Vote } from "./ConversationService";
import { incrementCount } from "./datadog";
import { VOTED, mixpanel } from "./mixpanel";

dotenv.config({
  path: ".env.local",
});

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

export async function checkForVote(communityId: string, handle: string) {
  const response = await prisma.vote.findFirst({
    where: {
      communityId,
      instagramHandle: handle,
    },
  });

  return response;
}

export async function getVotesForCommunityId(communityId: string) {
  const response = await prisma.vote.findMany({
    where: {
      communityId,
    },
  });

  return response;
}

export async function getUniqueVotesForCommunityId(communityId: string) {
  const response = await getVotesForCommunityId(communityId);
  // get unique votes by handle and communityId

  const uniqueVotes = response.reduce((acc, vote) => {
    if (!acc.find((v) => v.vote === vote.instagramHandle)) {
      acc.push({
        vote: vote.instagramHandle,
        timestamp: vote.timestamp,
        voter: vote.communityId,
      });
    }

    return acc;
  }, [] as Vote[]);

  return uniqueVotes;
}

async function createLeaderboard(
  startTime: Date,
  endTime: Date,
  connectedVoteIds: string[],
  connectedScriptRuns: string[],
) {
  const response = await prisma.leaderboard.create({
    data: {
      id: 1,
      startTime,
      endTime,
      showCounts: false,
      showEmojis: false,
      cacheSource: "",
      updateFrequencySeconds: 300,
      lastCachedAt: new Date(),
      votes: {
        connect: connectedVoteIds.map((id) => {
          return { id };
        }),
      },
      scriptRuns: {
        connect: connectedScriptRuns.map((id) => {
          return { id };
        }),
      },
    },
    include: {
      votes: true,
    },
  });

  return response;
}

export async function getLatestScriptRun() {
  // get latest script run from prisma
  const latest_script_run = await prisma.scriptRun.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  });

  return latest_script_run;
}

export async function createEmptyScriptRun() {
  const response = await prisma.scriptRun.create({
    data: {
      leaderboardId: FIRST_LEADERBOARD_ID,
    },
  });

  return response;
}

export async function saveVotesToDB(votes: Vote[]) {
  // create new script run
  const response = await prisma.scriptRun.create({
    data: {
      timestamp: new Date(),
      votes: {
        createMany: {
          data: votes.map((vote) => ({
            instagramHandle: vote.vote,
            timestamp: vote.timestamp,
            communityId: vote.voter,
            leaderboardId: FIRST_LEADERBOARD_ID,
          })),
        },
      },
      leaderboardId: FIRST_LEADERBOARD_ID,
    },
    include: {
      votes: true,
    },
  });

  incrementCount("scriptRuns", 1);
  incrementCount("votes", response.votes.length);

  // send to mixpanel
  response.votes.forEach((vote) => {
    mixpanel.track(VOTED, {
      community_id: vote.communityId,
      username: vote.instagramHandle,
      timestamp: vote.timestamp,
    });
  });

  return response;
}

export async function saveVotesOnlyToDB(votes: Vote[]) {
  // create new script run
  const response = await prisma.vote.createMany({
    data: votes.map((vote) => ({
      instagramHandle: vote.vote,
      timestamp: vote.timestamp,
      communityId: vote.voter,
      leaderboardId: FIRST_LEADERBOARD_ID,
    })),
  });

  incrementCount("votes", response.count);
  return response;
}

async function getAllVotes() {
  const response = await prisma.vote.findMany();
  return response;
}

async function getAllScriptRuns() {
  const response = await prisma.scriptRun.findMany();
  return response;
}

async function createAndJoinVotesToLeaderboard() {
  const votes = await getAllVotes();
  const voteIds = votes.map((vote) => vote.id);

  const scriptRuns = await getAllScriptRuns();
  const scriptRunIds = scriptRuns.map((scriptRun) => scriptRun.id);

  const startTime = new Date("2022-12-05T18:00:00.000Z");
  const endTime = new Date("2022-12-07T18:00:00.000Z");

  const leaderboard = await createLeaderboard(startTime, endTime, voteIds, scriptRunIds);
  return leaderboard;
}

// async function main() {
//   const leaderboard = await createAndJoinVotesToLeaderboard();
//   console.log(leaderboard);
// }

// main();
