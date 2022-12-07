import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Vote } from "./ConversationService";

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
  console.log("response", response, communityId);
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

  console.log("unique votes", uniqueVotes);
  return uniqueVotes;
}

async function main() {
  const votes = await getUniqueVotesForCommunityId("58704615-37e5-4148-804c-e675f5107968");
  console.log("votes", votes);
}

// main();
