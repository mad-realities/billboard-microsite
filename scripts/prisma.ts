import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { getVotesMapSinceDate } from "./script";

dotenv.config({
  path: ".env.local",
});

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const keywords = ["VOTE:ALICE", "VOTE:DAVID", "VOTE:SHREY", "VOTE:SARAH", "VOTE:EVAN", "VOTE:DEVIN"];

function createNVotes(n: number, vote: { community_id: string; keyword: string }) {
  // return an array of length n with the vote as the element
  const votes = [];
  for (let i = 0; i < n; i++) {
    votes.push(vote);
  }
  return votes;
}

async function main() {
  // get latest script run from prisma
  const latest_script_run = await prisma.scriptRun.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  });

  if (latest_script_run) {
    const dateSinceLastRun = new Date(latest_script_run.timestamp);
    const user_keyword_counts = await getVotesMapSinceDate(keywords, dateSinceLastRun);
    console.log("user_keyword_counts", user_keyword_counts);
    const userVotes = Object.keys(user_keyword_counts).map((community_id) => {
      const keyword_counts = user_keyword_counts[community_id];
      const votes = Object.keys(keyword_counts).map((keyword) => {
        const vote = keyword_counts[keyword];
        return createNVotes(vote, { community_id, keyword });
      });
      return votes;
    });

    const votes = userVotes.flat().flat();

    // create new script run
    const new_script_run = await prisma.scriptRun.create({
      data: {
        timestamp: new Date(),
        votes: {
          createMany: {
            data: votes.map((vote) => ({
              communityId: vote.community_id,
              voteSlug: vote.keyword,
              timestamp: new Date(),
            })),
          },
        },
      },
      include: {
        votes: true,
      },
    });

    console.log("new_script_run", new_script_run);
  } else {
    console.log("No script runs yet");
  }
}

main();
