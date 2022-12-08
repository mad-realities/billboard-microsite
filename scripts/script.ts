import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { instagramVote } from "./instagram";
import { delay } from "./utils";
import { CommunityService, MessagingProvider } from "./CommunityService";
import { Vote } from "./ConversationService";
import { createEmptyScriptRun, getLatestScriptRun, saveVotesToDB } from "./db";
import { registerKeywords, registerSendVoteMessages, registerVotes } from "./keywordRegisters";

dotenv.config({
  path: ".env.local",
});

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

  const latestScriptRun = await getLatestScriptRun();

  if (latestScriptRun) {
    const dateSinceLastRun = new Date(latestScriptRun.timestamp);
    console.log("Last script ran at", dateSinceLastRun.toLocaleString());

    const messagingProvider: MessagingProvider = new CommunityService();
    const messagesSinceLastRun = await messagingProvider.getMessagesSinceDate(dateSinceLastRun);

    // call registerKeywords with the keywords array and the function that takes in keywordMessages and returns a promise of type T
    const {
      dbRecords: { votes },
      messagePayload: voteMessagePayload,
    } = await registerKeywords(["vote: ", "vote "], messagesSinceLastRun, registerVotes);

    const {
      dbRecords: { votes: votesForDb },
      messagePayload: sendVoteMessagePayload,
    } = await registerKeywords(
      ["send:votes", "send votes", "send nudes"],
      messagesSinceLastRun,
      registerSendVoteMessages,
    );

    const messages = [...voteMessagePayload, ...sendVoteMessagePayload];

    // create new script run
    if (!debug) {
      const scriptRun = await saveVotesToDB(votesForDb);
      console.log("Sending", messages);
      const count = await messagingProvider.sendMessages(messages);
      return { scriptRun, messagesSent: count };
    } else {
      console.log("Debug mode, not saving votes to DB");
      console.log("Messages to send", messages);
      return null;
    }
  } else {
    const new_script_run = await createEmptyScriptRun();
    return { new_script_run, messagesSent: 0 };
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

runScript({
  debug: true,
});
