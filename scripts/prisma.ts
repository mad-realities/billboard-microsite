import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { getVotesSinceDate } from "./community";
import { triggerCommunityMessageZap } from "./zapier";

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

async function createEmptyScriptRun() {
  const response = await prisma.scriptRun.create({
    data: {},
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
    const userMap = await getVotesSinceDate(dateSinceLastRun);
    console.log("userMap", userMap);
    const userVotes = Object.keys(userMap).map((community_id) => {
      return {
        community_id,
        vote: userMap[community_id].igHandle,
        timestamp: userMap[community_id].timestamp,
      };
    });

    // // create new script run
    const new_script_run = await prisma.scriptRun.create({
      data: {
        timestamp: new Date(),
        votes: {
          createMany: {
            data: userVotes.map((vote) => ({
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

    const zapierPayload = new_script_run.votes.map((vote) => ({
      fanId: userMap[vote.communityId].fanId,
      text: getTextForVote(vote.instagramHandle),
    }));

    if (zapierPayload.length > 0) {
      await triggerCommunityMessageZap(zapierPayload);
    }

    console.log("new_script_run", new_script_run);
  } else {
    console.log("No script runs yet, creating empty script run.");
    const new_script_run = await createEmptyScriptRun();
    console.log("Created new script run", new_script_run);
  }
}

function getTextForVote(igHandle: string) {
  return `You voted for https://www.instagram.com/${igHandle}/ ! To change your vote, text VOTE: followed by the Instagram handle of the creator you want to vote for.`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runScript();
