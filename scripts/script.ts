import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { dm, getKeywordMessages, getMessagesSinceDate, getVotesFromMessages, getVotesSinceDate } from "./community";
import { isValidUsername } from "./igData";
import { incrementCount } from "./datadog";
import { triggerCommunityMessageZap } from "./zapier";
import { mixpanel, VOTED } from "./mixpanel";
import { delay } from "./utils";

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

    // community ids which have a bad vote message and not a valid vote
    const badVotesIds = Object.keys(badVoteMessage).filter((communityId) => {
      return !userVotesMap[communityId];
    });

    const badVoteZapierPayload = badVotesIds.map((val) => ({
      communityId: val,
      fanId: communityIdToFanSubscriptionId[val],
      text: `Oops! That didn't work... If you're trying to vote for an existing candidate or nominate a new one, use the format below:\n\nVOTE: [insert IG username]\n\nText "3" for help voting.`,
    }));

    // seen
    const communityIdToVoteCount: { [communityId: string]: boolean } = {};

    const successfulZapierPayload = validUserVotesWithExistingHandles.map((val) => {
      if (communityIdToVoteCount[val.community_id]) {
        return {
          communityId: val.community_id,
          fanId: communityIdToFanSubscriptionId[val.community_id],
          text: `SUCCESS! You also voted for ${val.vote}. You can see the rank of their username by clicking the link below. https://billboard.madrealities.xyz/profile/${val.vote}`,
        };
      } else {
        communityIdToVoteCount[val.community_id] = true;
        return {
          communityId: val.community_id,
          fanId: communityIdToFanSubscriptionId[val.community_id],
          text: `SUCCESS! Thanks for exercising your civic duty in the Mad Realities Universe by casting your vote. You can see the rank of the username you nominated or voted for by clicking the link below. Share and rack up as many votes as you can to get to #1! https://billboard.madrealities.xyz/profile/${val.vote}`,
        };
      }
    });

    console.log("communityIdToFanSubscriptionId", communityIdToFanSubscriptionId);

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

export async function sendMessages(
  payload: {
    fanId: string;
    text: string;
    communityId: string;
  }[],
) {
  console.log("Sending messages", payload);
  let count = 0;
  // serial loop through payload, pause for .3-.7 seconds betwee, send dm for each
  for (const message of payload) {
    const randomDelay = Math.floor(Math.random() * 400) + 300;
    await delay(randomDelay);
    const response = await dm(message.communityId, message.text);
    if (response) {
      count++;
    } else {
      console.log("Error sending message", message);
    }
  }

  console.log("Sent", count, "messages out of ", payload.length);
}
