import fetch from "node-fetch";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { incrementCount, trackGauge } from "./datadog";
import { delay } from "./utils";
import { SUCCESSFUL_VOTE_RESPONSE } from "./constants";
import { ConversationService, Vote } from "./ConversationService";
import { checkForVote } from "./db";
import { CommunityService, MessagingProvider } from "./CommunityService";
import { instagramVote } from "./igData";
import { prepareVote, saveVotesOnlyToDB } from "./script";
dotenv.config({
  path: ".env.local",
});

let headers = {
  Authorization: `Bearer ${process.env.COMMUNITY_TOKEN}`,
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
  Accept: "*/*",
};

type CommunityMessage = {
  created_at: Date;
  id: string;
  inbound: boolean;
  media: string;
  source_type: string;
  status: string;
  text: string;
};

type MessageHistoryResponse = {
  data: CommunityMessage[];
};

type ChatsResponse = {
  data: any[];
};

export async function getMostRecentVotesSinceDate(
  messagingProvider: MessagingProvider,
  dateSince: Date,
  keyword = "vote: ",
) {
  const messageMap = await messagingProvider.getMessagesSinceDate(dateSince);
  const communityIdMessageWithWordMap = ConversationService.getMessagesWithSpecificWord(messageMap, keyword);
  const communityIdMostRecentMessageMap = ConversationService.getMostRecentMessageMap(communityIdMessageWithWordMap);
  const idsToVote = ConversationService.getVoteMapFromMessageMap(communityIdMostRecentMessageMap, keyword);
  return idsToVote;
}

export async function getAllVotesSinceDate(messagingProvider: MessagingProvider, dateSince: Date, keyword = "vote: ") {
  const messageMap = await messagingProvider.getMessagesSinceDate(dateSince);
  const messagesWithKeyword = ConversationService.getMessagesWithSpecificWord(messageMap, keyword);
  const idsToVotes = ConversationService.getVotesFromMessages(messagesWithKeyword, keyword);
  return idsToVotes;
}

const messagingProvider: MessagingProvider = new CommunityService();

async function main(messagingProvider: MessagingProvider) {
  // const response = await dm("58704615-37e5-4148-804c-e675f5107968", "gm gm");
  const votingOpened = new Date("2022-12-05T18:30:00.000");
  const dateSince = new Date("2022-12-06T10:20:00.000");
  const dateSince2 = new Date("2022-12-07T10:50:00.000");

  await followUpOnConversations(messagingProvider, dateSince, votingOpened, false);
  // const allvotes = await getAllVotesSinceDate(messagingProvider, dateSince);
  // console.log(allvotes);
}

async function followUpOnConversations(
  messagingProvider: MessagingProvider,
  conversationDateSince: Date,
  messageHistorySince: Date,
  autoFollowUp: boolean = false,
) {
  const conversationMap = await messagingProvider.getMessagesSinceDate(conversationDateSince, messageHistorySince);
  const followUps: ConversationFollowUp[] = [];

  let counter = 0;
  for (const id in conversationMap) {
    counter++;
    console.log("checking conversation", counter, "of", Object.keys(conversationMap).length);
    let flups = await checkConversation(id, conversationMap[id]);
    followUps.push(...flups);
  }

  const payload: MessagePayload[] = [];
  const votes: Vote[] = [];

  for (const followUp of followUps) {
    if (followUp.type === "VOTED WITHOUT EVER SENDING RESPONSE") {
      payload.push({
        communityId: followUp.communityId,
        text: SUCCESSFUL_VOTE_RESPONSE(followUp.vote.replace("@", "")),
      });
    } else if (followUp.type === "VOTED WITHOUT NEW RESPONSE") {
      payload.push({
        communityId: followUp.communityId,
        text: SUCCESSFUL_VOTE_RESPONSE(followUp.vote.replace("@", "")),
      });
    } else if (followUp.type === "NO VOTE RECORD") {
      const vote: Vote = {
        voter: followUp.communityId,
        vote: followUp.vote,
        timestamp: followUp.voteTimestamp,
      };
      const preparedVote = await prepareVote(vote);
      if (preparedVote) {
        votes.push(preparedVote);
      }
    }
  }

  // group follow ups and payload by community id
  const communityIdToFollowUps: {
    [communityId: string]: { followUps: ConversationFollowUp[]; followUpMessages: MessagePayload[] };
  } = {};
  for (const followUp of followUps) {
    if (!communityIdToFollowUps[followUp.communityId]) {
      communityIdToFollowUps[followUp.communityId] = { followUps: [followUp], followUpMessages: [] };
    } else {
      communityIdToFollowUps[followUp.communityId].followUps.push(followUp);
    }
  }

  for (const message of payload) {
    if (!communityIdToFollowUps[message.communityId]) {
      communityIdToFollowUps[message.communityId] = { followUps: [], followUpMessages: [message] };
    } else {
      communityIdToFollowUps[message.communityId].followUpMessages.push(message);
    }
  }

  if (autoFollowUp) {
    await saveVotesOnlyToDB(votes);
    await messagingProvider.sendMessages(payload);
  }

  console.log("messages", payload.length);
  console.log("messages", payload);

  console.log("users", Object.keys(communityIdToFollowUps).length);

  console.log("new votes", votes.length);
  console.log("votes", votes);
}

type ConversationFollowUp = {
  type: "VOTED WITHOUT NEW RESPONSE" | "VOTED WITHOUT EVER SENDING RESPONSE" | "NO VOTE RECORD";
  communityId: string;
  voteTimestamp: Date;
  messageText: string;
  vote: string;
  communityUrl: string;
};

async function checkConversation(cid: string, conversation: CommunityMessage[]) {
  const followUps: ConversationFollowUp[] = [];
  const toCommunityMessages = conversation.filter((m) => m.inbound);
  const fromCommunityMessages = conversation.filter((message) => !message.inbound);

  const mostRecentInboundMessage = ConversationService.getMostRecentMessage(conversation, "inbound");
  const voteMessages = ConversationService.getKeywordMessages({ id: toCommunityMessages }, "vote: ");

  const voteMessagesArr = voteMessages["id"] ? voteMessages["id"] : [];
  // filter out votes in last 10 minutes
  const filteredVoteMessages = voteMessagesArr.filter((vm) => {
    const vmDate = new Date(vm.created_at);
    const diff = new Date().getTime() - vmDate.getTime();
    return diff > 10 * 60 * 1000;
  });

  const handles = new Set<string>([]);
  // check vote for each vote message
  for (const vm of filteredVoteMessages) {
    const handle = ConversationService.getVote(vm, "vote: ");
    if (handles.has(handle.vote)) {
      continue;
    }
    const vote = await checkForVote(cid, handle.vote);
    if (!vote) {
      followUps.push({
        type: "NO VOTE RECORD",
        communityId: cid,
        vote: handle.vote,
        voteTimestamp: new Date(vm.created_at),
        messageText: vm.text,
        communityUrl: `https://dashboard.community.com/messages/inbox/${cid}`,
      });
    }

    handles.add(handle.vote);
  }

  const mostRecentOutboundMessage = ConversationService.getMostRecentMessage(conversation, "outbound");

  // vote messages more than 10 minutes ago and after most recent outbound message
  const voteMessagesAfterOutbound = voteMessagesArr.filter((m) => {
    if (mostRecentOutboundMessage) {
      return (
        new Date(m.created_at).getTime() > new Date(mostRecentOutboundMessage.created_at).getTime() &&
        new Date(m.created_at).getTime() < new Date().getTime() - 10 * 60 * 1000
      );
    } else {
      return new Date(m.created_at).getTime() < new Date().getTime() - 10 * 60 * 1000;
    }
  });

  for (const voteMessage of voteMessagesAfterOutbound) {
    const handle = ConversationService.getVote(voteMessage, "vote: ");
    if (!mostRecentOutboundMessage) {
      followUps.push({
        type: "VOTED WITHOUT EVER SENDING RESPONSE",
        communityId: cid,
        vote: handle.vote,
        voteTimestamp: new Date(voteMessage.created_at),
        messageText: voteMessage.text,
        communityUrl: `https://dashboard.community.com/messages/inbox/${cid}`,
      });
    } else {
      followUps.push({
        type: "VOTED WITHOUT NEW RESPONSE",
        communityId: cid,
        vote: handle.vote,
        voteTimestamp: new Date(voteMessage.created_at),
        messageText: voteMessage.text,
        communityUrl: `https://dashboard.community.com/messages/inbox/${cid}`,
      });
    }
  }

  return followUps;
}

export type MessagePayload = {
  text: string;
  communityId: string;
};

main(messagingProvider);
