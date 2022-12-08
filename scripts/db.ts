import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Vote } from "./ConversationService";
import { incrementCount } from "./datadog";
import { VOTED } from "./mixpanel";

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
          })),
        },
      },
    },
    include: {
      votes: true,
    },
  });

  incrementCount("scriptRuns", 1);
  incrementCount("votes", response.votes.length);

  // send to mixpanel
  votes.forEach((vote) => {
    mixpanel.track(VOTED, {
      community_id: vote.voter,
      username: vote.vote,
      timestamp: vote.timestamp,
    });
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
    data: {},
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
    })),
  });

  incrementCount("votes", response.count);
  return response;
}

async function main() {
  const votes = await getUniqueVotesForCommunityId("58704615-37e5-4148-804c-e675f5107968");
  console.log("votes", votes);
}

// main();
