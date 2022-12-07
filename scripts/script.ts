import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { MessagePayload, getAllVotesSinceDate } from "./controller";
import { instagramVote, isValidUsername } from "./igData";
import { incrementCount } from "./datadog";
import { triggerCommunityMessageZap } from "./zapier";
import { mixpanel, VOTED } from "./mixpanel";
import { delay } from "./utils";
import { ANOTHER_SUCCESSFUL_VOTE_RESPONSE, BAD_VOTE_RESPONSE, SUCCESSFUL_VOTE_RESPONSE } from "./constants";
import { CommunityService, MessagingProvider } from "./CommunityService";
import { ConversationService, Message, Vote } from "./ConversationService";
import { getUniqueVotesForCommunityId, getVotesForCommunityId } from "./db";

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

async function saveVotesToDB(votes: Vote[]) {
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

interface RunScriptOptions {
  debug?: boolean;
  withDelay?: boolean;
}

export async function runScript({ debug = false, withDelay = false }: RunScriptOptions = {}) {
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

    const messagingProvider: MessagingProvider = new CommunityService();

    const messagesSinceLastRun = await messagingProvider.getMessagesSinceDate(dateSinceLastRun);
    const idsToVotes = ConversationService.getVotesFromMessages(messagesSinceLastRun, "vote: ");

    const badVotesMessage = ConversationService.getMessagesWithSpecificWord(messagesSinceLastRun, "vote ", true);
    const sendColonVotesMessages = ConversationService.getMessagesWithSpecificWord(messagesSinceLastRun, "send:votes");
    const sendVotesMessages = ConversationService.getMessagesWithSpecificWord(messagesSinceLastRun, "send votes");
    console.log("sendVotesMessages", sendVotesMessages);
    const sendNudesMessages = ConversationService.getMessagesWithSpecificWord(messagesSinceLastRun, "send nudes");
    const allSendVoteMessages: {
      [x: string]: Message[];
    } = {};

    Object.keys(sendVotesMessages).forEach((val) => {
      allSendVoteMessages[val] = sendVotesMessages[val];
    });

    Object.keys(sendColonVotesMessages).forEach((val) => {
      if (allSendVoteMessages[val]) {
        allSendVoteMessages[val] = [...allSendVoteMessages[val], ...sendColonVotesMessages[val]];
      } else {
        allSendVoteMessages[val] = [...sendColonVotesMessages[val]];
      }
    });

    Object.keys(sendNudesMessages).forEach((val) => {
      if (allSendVoteMessages[val]) {
        allSendVoteMessages[val] = [
          ...allSendVoteMessages[val],
          ...sendColonVotesMessages[val],
          ...sendNudesMessages[val],
        ];
      } else {
        allSendVoteMessages[val] = [...sendNudesMessages[val]];
      }
    });

    const allUserVotes = Object.values(idsToVotes).flat();

    // remove leading @ from each vote in userVotes
    allUserVotes.forEach((vote) => {
      vote.vote = vote.vote.replace("@", "");
    });

    // filter out invalid handles
    const validUserVotes = allUserVotes.filter((vote) => validInstagramHandle(vote.vote));

    // deduplicate votes by voter and vote
    const dedupedUserVotes = validUserVotes.reduce((acc, vote) => {
      const existingVote = acc.find((val) => val.voter === vote.voter && val.vote === vote.vote);
      if (!existingVote) {
        acc.push(vote);
      }
      return acc;
    }, [] as Vote[]);

    const realInstagramVotes: Vote[] = [];
    for (const vote of dedupedUserVotes) {
      const igVote = await instagramVote(vote);
      if (igVote) {
        realInstagramVotes.push(igVote);
      }
    }

    // community ids which have a bad vote message and not a valid vote
    const badVotesIds: string[] = [];
    Object.keys(badVotesMessage).forEach((val) => {
      if (!idsToVotes[val]) {
        badVotesIds.push(val);
      }
    });

    const badVotePayload: MessagePayload[] = badVotesIds.map((val) => ({
      communityId: val,
      text: BAD_VOTE_RESPONSE(),
    }));

    const sendVoteMessagePayload: MessagePayload[] = [];

    // { ...sendVotesMessages, ...sendNudesMessages, ...sendColonVotesMessages };

    console.log("allSendVoteMessages", allSendVoteMessages);

    for (const cid of Object.keys(allSendVoteMessages)) {
      if (allSendVoteMessages[cid].length > 0) {
        const votes = await getUniqueVotesForCommunityId(cid);
        const votesString = votes.map((vote) => vote.vote).join("\n@");
        sendVoteMessagePayload.push({
          communityId: cid,
          text: `@${votesString}`,
        });
      }
    }

    const communityIdToVoteCount: { [communityId: string]: boolean } = {};
    const communityIdToVote: { [communityId: string]: string[] } = {};
    const successMessagePayload: MessagePayload[] = [];
    console.log("realInstagramVotes", realInstagramVotes);

    realInstagramVotes.forEach((val) => {
      if (!communityIdToVote[val.voter]) {
        communityIdToVote[val.voter] = [];
      }

      if (communityIdToVoteCount[val.voter]) {
        if (!communityIdToVote[val.voter].includes(val.vote)) {
          communityIdToVote[val.voter].push(val.vote);
          successMessagePayload.push({
            communityId: val.voter,
            text: ANOTHER_SUCCESSFUL_VOTE_RESPONSE(val.vote),
          });
        }
      } else {
        communityIdToVoteCount[val.voter] = true;
        communityIdToVote[val.voter].push(val.vote);
        successMessagePayload.push({
          communityId: val.voter,
          text: SUCCESSFUL_VOTE_RESPONSE(val.vote),
        });
      }
    });

    const messages = [...successMessagePayload, ...badVotePayload, ...sendVoteMessagePayload];
    for (const vote of realInstagramVotes) {
      mixpanel.track(VOTED, {
        community_id: vote.voter,
        username: vote.vote,
        timestamp: vote.timestamp,
      });
    }

    // create new script run
    if (!debug) {
      const scriptRun = await saveVotesToDB(realInstagramVotes);
      console.log("Sending", messages);
      const count = await messagingProvider.sendMessages(messages);
      console.log("Sent", count, "messages out of ", messages.length, "messages");

      incrementCount("messagesSent", count);
      incrementCount("scriptRuns", 1);
      incrementCount("votes", realInstagramVotes.length);
      return scriptRun;
    } else {
      console.log("Debug mode, not saving votes to DB");
      console.log("Messages to send", messages);
      return null;
    }
  } else {
    const new_script_run = await createEmptyScriptRun();
    return new_script_run;
  }
}

export async function prepareVote(vote: Vote) {
  vote.vote = vote.vote.replace("@", "");
  const igVote = await instagramVote(vote);
  if (igVote) {
    return igVote;
  } else {
    return null;
  }
}
// runScript({
//   debug: true,
// });
