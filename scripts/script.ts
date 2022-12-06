import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import {
  dm,
  getKeywordMessages,
  getMessagesSinceDate,
  getVotesFromMessages,
  getVotesSinceDate,
  MessagePayload,
  sendMessages,
} from "./community";
import { isValidUsername } from "./igData";
import { incrementCount } from "./datadog";
import { triggerCommunityMessageZap } from "./zapier";
import { mixpanel, VOTED } from "./mixpanel";
import { delay } from "./utils";
import { ANOTHER_SUCCESSFUL_VOTE_RESPONSE, BAD_VOTE_RESPONSE, SUCCESSFUL_VOTE_RESPONSE } from "./constants";

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

    // get messages since date
    const { communityIdMessageMap, communityIdToFanSubscriptionId } = await getMessagesSinceDate(dateSinceLastRun);

    const badVoteMessage = await getKeywordMessages(communityIdMessageMap, "vote ", true);

    // getVotesSinceDate picks up the latest vote per communityId since the last script run
    const userVotesMap = await getVotesFromMessages(communityIdMessageMap, communityIdToFanSubscriptionId);
    console.log("userVoteMap", userVotesMap);

    const allUserVotes = Object.keys(userVotesMap)
      .map((community_id) => {
        const userVotes = userVotesMap[community_id];
        return userVotes.map((vote) => ({
          community_id,
          vote: vote.igHandle,
          timestamp: vote.timestamp,
        }));
      })
      .flat();

    // remove leading @ from each vote in userVotes
    allUserVotes.forEach((vote) => {
      vote.vote = vote.vote.replace("@", "");
    });

    // filter out invalid handles
    const validUserVotes = allUserVotes.filter((vote) => validInstagramHandle(vote.vote));

    // filter out handles that don't exist
    const validUserVotesWithExistingHandles: {
      community_id: string;
      vote: string;
      timestamp: Date;
    }[] = [];
    for (const vote of validUserVotes) {
      try {
        const isValid = await isValidUsername(vote.vote);
        incrementCount("instgram.account.valid", 1, [`handle:${vote.vote}`, `valid:${isValid}`, "success"]);

        if (isValid) {
          validUserVotesWithExistingHandles.push(vote);
        } else {
          console.log("Invalid handle", vote.vote);
        }
      } catch (e) {
        console.log("Error checking if username", vote.vote, "exists.", "Error:", e);
        console.log("Since instagram check isn't working, we'll just assume it's valid");
        incrementCount("instgram.account.valid", 1, [`handle:${vote.vote}`, "failure"]);

        // since instagram check failed, we'll assume the handle is valid
        validUserVotesWithExistingHandles.push(vote);
      }
    }

    // community ids which have a bad vote message and not a valid vote
    const badVotesIds = Object.keys(badVoteMessage).filter((communityId) => {
      return !userVotesMap[communityId];
    });

    const badVoteZapierPayload: MessagePayload[] = badVotesIds.map((val) => ({
      communityId: val,
      fanId: communityIdToFanSubscriptionId[val],
      text: BAD_VOTE_RESPONSE(),
    }));

    // seen
    const communityIdToVoteCount: { [communityId: string]: boolean } = {};
    const communityIdToVote: { [communityId: string]: string[] } = {};
    const successfulZapierPayload: MessagePayload[] = [];

    console.log("validUserVotesWithExistingHandles", validUserVotesWithExistingHandles);

    validUserVotesWithExistingHandles.forEach((val) => {
      if (!communityIdToVote[val.community_id]) {
        communityIdToVote[val.community_id] = [];
      }

      if (communityIdToVoteCount[val.community_id]) {
        if (!communityIdToVote[val.community_id].includes(val.vote)) {
          communityIdToVote[val.community_id].push(val.vote);
          successfulZapierPayload.push({
            communityId: val.community_id,
            fanId: communityIdToFanSubscriptionId[val.community_id],
            text: ANOTHER_SUCCESSFUL_VOTE_RESPONSE(val.vote),
          });
        }
      } else {
        communityIdToVoteCount[val.community_id] = true;
        communityIdToVote[val.community_id].push(val.vote);
        successfulZapierPayload.push({
          communityId: val.community_id,
          fanId: communityIdToFanSubscriptionId[val.community_id],
          text: SUCCESSFUL_VOTE_RESPONSE(val.vote),
        });
      }
    });

    // triggerCommunityMessageZap([...successfulZapierPayload, ...badVoteZapierPayload]);
    incrementCount("scriptRuns", 1);
    incrementCount("votes", validUserVotesWithExistingHandles.length);
    for (const vote of validUserVotesWithExistingHandles) {
      mixpanel.track(VOTED, {
        community_id: vote.community_id,
        username: vote.vote,
        timestamp: vote.timestamp,
      });
    }

    // create new script run
    const scriptRun = await saveVotesToDB(validUserVotesWithExistingHandles);
    await sendMessages([...successfulZapierPayload, ...badVoteZapierPayload]);
    return scriptRun;
  } else {
    const new_script_run = await createEmptyScriptRun();
    return new_script_run;
  }
}

runScript();
