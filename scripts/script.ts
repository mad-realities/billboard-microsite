import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { getVotesSinceDate } from "./community";

dotenv.config({
  path: ".env.local",
});

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function createEmptyScriptRun() {
  const response = await prisma.scriptRun.create({
    data: {},
  });

  return response;
}

async function saveVotesToDB(
  votes: {
    community_id: string;
    vote: string;
    timestamp: Date;
  }[],
) {
  // create new script run
  const response = await prisma.scriptRun.create({
    data: {
      timestamp: new Date(),
      votes: {
        createMany: {
          data: votes.map((vote) => ({
            instagramHandle: vote.vote,
            timestamp: vote.timestamp,
            communityId: vote.community_id,
          })),
        },
      },
    },
    include: {
      votes: true,
    },
  });

  return response;
}

export async function runScript(withDelay = false) {
  // random number of miliseconds between 5 seconds and 2 minutes
  if (withDelay) {
    const randomDelay = Math.floor(Math.random() * 120000) + 5000;
    console.log("Waiting", randomDelay, "ms");
    await delay(randomDelay);
  }

  // get latest script run from prisma
  const latest_script_run = await prisma.scriptRun.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  });

  if (latest_script_run) {
    const dateSinceLastRun = new Date(latest_script_run.timestamp);
    console.log("Last script ran at", dateSinceLastRun.toLocaleString());

    // getVotesSinceDate picks up the latest vote per communityId since the last script run
    const userVotesMap = await getVotesSinceDate(dateSinceLastRun);
    console.log("userMap", userVotesMap);

    const userVotes = Object.keys(userVotesMap).map((community_id) => {
      return {
        community_id,
        vote: userVotesMap[community_id].igHandle,
        timestamp: userVotesMap[community_id].timestamp,
      };
    });

    // fetch instagram data for each user

    // create new script run
    const scriptRun = await saveVotesToDB(userVotes);

    console.log("Final Push", scriptRun);
  } else {
    console.log("No script runs yet, creating empty script run.");
    const new_script_run = await createEmptyScriptRun();
    console.log("Created new script run", new_script_run);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runScript();
