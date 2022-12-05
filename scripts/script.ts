import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { getVotesSinceDate } from "./community";
import { isValidUsername } from "./igData";
import { incrementCount } from "./datadog";
import { triggerCommunityMessageZap } from "./zapier";

dotenv.config({
  path: ".env.local",
});

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

/**
 * Your handle can't exceed 30 characters
 * It can only contain letters, numbers, and periods
 * It can't contain symbols or punctuation marks
 * It needs to be unique
 */
function validInstagramHandle(handle: string) {
  return handle.length <= 30 && /^[a-zA-Z0-9._]+$/.test(handle);
}

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

    // remove leading @ from each vote in userVotes
    userVotes.forEach((vote) => {
      vote.vote = vote.vote.replace("@", "");
    });

    // filter out invalid handles
    const validUserVotes = userVotes.filter((vote) => validInstagramHandle(vote.vote));

    // filter out handles that don't exist
    const validUserVotesWithExistingHandles: {
      community_id: string;
      vote: string;
      timestamp: Date;
    }[] = [];
    for (const vote of validUserVotes) {
      try {
        const isValid = await isValidUsername(vote.vote);
        if (isValid) {
          validUserVotesWithExistingHandles.push(vote);
        } else {
          console.log("Invalid handle", vote.vote);
        }
      } catch (e) {
        console.log("Error checking if username", vote.vote, "exists.", "Error:", e);
        console.log("Since instagram check isn't working, we'll just assume it's valid");

        // since instagram check failed, we'll assume the handle is valid
        validUserVotesWithExistingHandles.push(vote);
      }
    }

    const zapierPayload = validUserVotesWithExistingHandles.map((val) => ({
      fanId: userVotesMap[val.community_id].fanId,
      text: `SUCCESS! Thanks for exercising your civic duty in the Mad Realities Universe by casting your vote. Check your votes "RANK": https://billboard.madrealities.xyz/profile/${val.vote}`,
    }));

    triggerCommunityMessageZap(zapierPayload);

    incrementCount("scriptRuns", 1);
    incrementCount("votes", validUserVotesWithExistingHandles.length);

    // create new script run
    const scriptRun = await saveVotesToDB(validUserVotesWithExistingHandles);
    return scriptRun;
  } else {
    const new_script_run = await createEmptyScriptRun();
    return new_script_run;
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runScript();
