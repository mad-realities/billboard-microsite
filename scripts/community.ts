import fetch from "node-fetch";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { incrementCount, trackGauge } from "./datadog";
import { delay } from "./utils";
import { SUCCESSFUL_VOTE_RESPONSE } from "./constants";

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

function addDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function get_community_ids_that_messaged_since_date_from_chats(since_date: Date, chats: any[]) {
  const community_ids: { communityId: string; fanSubscriptionId: string }[] = [];
  chats.forEach((chat) => {
    const last_message_at = new Date(chat["last_msg"]["created_at"]);
    if (last_message_at > since_date) {
      const communityId = chat["fan_profile"]["id"];
      const fanSubscriptionId = chat["fan_profile"]["fan_subscription_id"];
      community_ids.push({ communityId, fanSubscriptionId });
    }
  });

  return community_ids;
}

export async function dm(fanId: string, text: string, shorten_links: boolean = false) {
  try {
    const url = `https://api.community.com/client-dashboard/v2/edefb05a-ec9b-40ac-a3fd-7b2459d195cb/messaging/dm`;
    const payload = {
      text: text,
      fan_id: fanId,
      shorten_links: shorten_links,
    };
    const response = await fetch(url, {
      body: JSON.stringify(payload),
      headers: headers,
      method: "POST",
    });

    if (response.status === 201) {
      incrementCount("community.dm.status", 1, ["success"]);
      return true;
    } else {
      console.error("Error Sending DM: ", response.status, response.statusText);
      incrementCount("community.dm.status", 1, ["failure"]);
      return false;
    }
  } catch (e) {
    console.error("Error Sending DM", e);
    incrementCount("community.dm.status", 1, ["failure"]);
    return false;
  }
}

async function get_community_ids_that_messaged_since_date(since_date: Date) {
  let pageNumber = 1;
  const chats = await get_50_chats(pageNumber);
  const community_ids = get_community_ids_that_messaged_since_date_from_chats(since_date, chats["data"]);

  if (community_ids.length == 50) {
    // there are more than 50 chats, so we need to get the rest
    while (true) {
      pageNumber++;
      const next_page_chats = await get_50_chats(pageNumber);
      community_ids.push(...get_community_ids_that_messaged_since_date_from_chats(since_date, next_page_chats["data"]));
      if (next_page_chats["data"].length < 50) {
        break;
      }
    }
  }
  return community_ids;
}

async function get_50_chats(page_number: number = 1): Promise<ChatsResponse> {
  const url = `https://api.community.com/client-dashboard/messaging/chats?page_number=${page_number}&page_size=50`;
  const response = await fetch(url, { method: "GET", headers: headers });
  if (response.status !== 200) throw response.statusText;
  return (await response.json()) as ChatsResponse;
}

async function get_message_history(community_id: string): Promise<MessageHistoryResponse> {
  // For some odd reason, the community web client queries with a date 1 day in the future in UTC
  const queryDate = addDays(new Date(), 1);
  const queryDateString = queryDate.toISOString();
  const url = `https://api.community.com/client-dashboard/v2/edefb05a-ec9b-40ac-a3fd-7b2459d195cb/fans/${community_id}/message-history?end_date=${queryDateString}&page_size=50&tags\[not\]=auto-response`;
  const response = await fetch(url, { method: "GET", headers: headers });
  if (response.status !== 200) throw response.statusText;
  return (await response.json()) as MessageHistoryResponse;
}

async function get_message_history_since_date(
  community_id: string,
  since_date: Date,
  direction: "inbound" | "outbound" | "both",
) {
  const msg_history = await get_message_history(community_id);
  const msgs: any[] = msg_history["data"];
  const inbound_messages_since_date = msgs
    .map((msg) => {
      const created_at = new Date(msg["created_at"]);
      if (direction === "both") {
        return created_at > since_date ? msg : null;
      } else if (direction === "inbound") {
        return msg["inbound"] && created_at > since_date ? msg : null;
      } else if (direction === "outbound") {
        return !msg["inbound"] && created_at > since_date ? msg : null;
      }

      return null;
    })
    .filter((msg) => msg !== null);
  return inbound_messages_since_date;
}

function count_keywords_in_text(messages: any[], keywords: string[]) {
  const keyword_counts: { [keyword: string]: number } = {};
  messages.forEach((msg) => {
    keywords.forEach((keyword) => {
      if (keyword_counts[keyword]) {
        keyword_counts[keyword] += msg["text"].toLowerCase().split(keyword.toLowerCase()).length - 1;
      } else {
        keyword_counts[keyword] = msg["text"].toLowerCase().split(keyword.toLowerCase()).length - 1;
      }
    });
  });

  return keyword_counts;
}

export async function getVotesMapSinceDateByKeyword(keywords: string[], dateSince: Date) {
  const community_ids = await get_community_ids_that_messaged_since_date(dateSince);
  const ids_to_messages: { [community_id: string]: any } = {};
  for (const member of community_ids) {
    const messages = await get_message_history_since_date(member["communityId"], dateSince, "inbound");
    ids_to_messages[member["communityId"]] = messages;
  }

  const user_keyword_counts: { [communityId: string]: { [keyword: string]: number } } = {};
  Object.keys(ids_to_messages).forEach((community_id) => {
    const keyword_counts = count_keywords_in_text(ids_to_messages[community_id], keywords);
    user_keyword_counts[community_id] = keyword_counts;
  });

  return user_keyword_counts;
}

function getMessagesWithSpecificWord(
  ids_to_messages: {
    [community_id: string]: CommunityMessage[];
  },
  word: string,
  needsFollowUpWord: boolean = false,
) {
  const ids_to_messages_with_word: {
    [community_id: string]: CommunityMessage[];
  } = {};

  Object.keys(ids_to_messages).forEach((community_id) => {
    const messages = ids_to_messages[community_id];
    const messages_with_word = messages.filter((msg) => {
      if (msg.text) {
        const messageText = msg.text.replace(/^\s+|\s+$/g, "").toLowerCase();

        if (needsFollowUpWord) {
          return messageText.includes(word.toLowerCase()) && hasWordAfterKeyword(messageText, word);
        } else {
          return messageText.includes(word.toLowerCase());
        }
      }
    });

    ids_to_messages_with_word[community_id] = messages_with_word;
  });
  return ids_to_messages_with_word;
}

const getMostRecentMessage = (messages: CommunityMessage[], direction: "inbound" | "outbound" | "both" = "both") => {
  let mostRecentMessage: CommunityMessage | null = null;
  messages.forEach((msg) => {
    if (direction === "both") {
      if (!mostRecentMessage || new Date(msg.created_at) > new Date(mostRecentMessage.created_at)) {
        mostRecentMessage = msg;
      }
    } else if (direction === "inbound") {
      if (msg.inbound && (!mostRecentMessage || new Date(msg.created_at) > new Date(mostRecentMessage.created_at))) {
        mostRecentMessage = msg;
      }
    } else if (direction === "outbound") {
      if (!msg.inbound && (!mostRecentMessage || new Date(msg.created_at) > new Date(mostRecentMessage.created_at))) {
        mostRecentMessage = msg;
      }
    }
  });
  return mostRecentMessage as CommunityMessage | null;
};

async function getCommunityIdMessageMapSinceDate(
  communityIds: string[],
  dateSince: Date,
  direction: "inbound" | "outbound" | "both" = "both",
) {
  const communityIdMessageMap: { [communityId: string]: CommunityMessage[] } = {};
  for (const cid of communityIds) {
    // sleep for random amount of time to avoid rate limiting (max 100 requests per minute)
    await delay(Math.random() * 600);
    console.log("fetching messages for", cid);
    const messages = await get_message_history_since_date(cid, dateSince, direction);
    communityIdMessageMap[cid] = messages;
  }
  return communityIdMessageMap;
}

function getVote(message: CommunityMessage, keyword: string) {
  const messageText = message.text;
  const vote = messageText
    // remove extra spaces and lowercase
    .replace(/^\s+|\s+$/g, "")
    .toLowerCase()
    .split(keyword)[1];
  return { igHandle: vote, timestamp: new Date(message.created_at) };
}

function getIdToVoteHandleMap(mostRecentMessages: { [communityId: string]: CommunityMessage }, keyword: string) {
  const idsToInstgramHandleVote: { [communityId: string]: { igHandle: string; timestamp: Date } } = {};
  Object.keys(mostRecentMessages).forEach((community_id) => {
    if (mostRecentMessages[community_id]) {
      idsToInstgramHandleVote[community_id] = getVote(mostRecentMessages[community_id], keyword);
    }
  });
  return idsToInstgramHandleVote;
}

function getIdToVotesMap(messages: { [communityId: string]: CommunityMessage[] }, keyword: string) {
  const idsToInstgramHandleVote: { [communityId: string]: { igHandle: string; timestamp: Date }[] } = {};
  Object.keys(messages).forEach((community_id) => {
    const messagesWithKeyword = messages[community_id];
    const votes = messagesWithKeyword.map((message) => {
      return getVote(message, keyword);
    });
    idsToInstgramHandleVote[community_id] = votes;
  });

  return idsToInstgramHandleVote;
}

function getMostRecentMessagePerMember(communityIdMessageMap: { [communityId: string]: CommunityMessage[] }) {
  const communityIdMostRecentMessageMap: { [communityId: string]: CommunityMessage } = {};
  Object.keys(communityIdMessageMap).forEach((cid) => {
    const messages = communityIdMessageMap[cid];
    const mostRecentMessage = getMostRecentMessage(messages, "inbound");
    if (mostRecentMessage) {
      communityIdMostRecentMessageMap[cid] = mostRecentMessage;
    }
  });
  return communityIdMostRecentMessageMap;
}

export async function getMessagesSinceDate(dateSince: Date) {
  const communityIds = await get_community_ids_that_messaged_since_date(dateSince);
  const communityIdToFanSubscriptionId: { [communityId: string]: string } = {};
  communityIds.forEach((member) => {
    communityIdToFanSubscriptionId[member.communityId] = member.fanSubscriptionId;
  });
  const communityIdsOnly = communityIds.map((member) => member.communityId);
  const communityIdMessageMap = await getCommunityIdMessageMapSinceDate(communityIdsOnly, dateSince, "inbound");
  return { communityIdMessageMap, communityIdToFanSubscriptionId };
}

export function getKeywordMessages(
  communityIdMessageMap: { [communityId: string]: CommunityMessage[] },
  keyword: string,
  needsFollowUpWord: boolean = false,
) {
  const communityIdMessageWithWordMap = getMessagesWithSpecificWord(communityIdMessageMap, keyword);
  return communityIdMessageWithWordMap;
}

export async function getVotesFromMessages(
  communityIdMessageMap: { [communityId: string]: CommunityMessage[] },
  communityIdToFanSubscriptionId: { [communityId: string]: string },
  voteKeyword = "vote: ",
) {
  const communityIdMessageWithWordMap = getMessagesWithSpecificWord(communityIdMessageMap, voteKeyword);
  // const communityIdMostRecentMessageMap = getMostRecentMessagePerMember(communityIdMessageWithWordMap);
  const idsToInstgramHandleVote = getIdToVotesMap(communityIdMessageWithWordMap, voteKeyword);
  const idToFanIdAndVote: { [communityId: string]: { igHandle: string; timestamp: Date }[] } = {};
  Object.keys(idsToInstgramHandleVote).forEach((communityId) => {
    const fanId = communityIdToFanSubscriptionId[communityId];
    const votes = idsToInstgramHandleVote[communityId];
    idToFanIdAndVote[communityId] = [...votes];
  });
  return idToFanIdAndVote;
}

export async function getVotesSinceDate(dateSince: Date, keyword = "vote: ") {
  // includes fan subscription id and community id
  const community_ids = await get_community_ids_that_messaged_since_date(dateSince);
  const communityIdToFanSubscriptionId: { [communityId: string]: string } = {};
  community_ids.forEach((member) => {
    communityIdToFanSubscriptionId[member.communityId] = member.fanSubscriptionId;
  });
  trackGauge("communityConvos", community_ids.length);

  const communityIds = community_ids.map((c) => c.communityId);
  const communityIdMessageMap = await getCommunityIdMessageMapSinceDate(communityIds, dateSince, "inbound");
  const communityIdMessageWithWordMap = getMessagesWithSpecificWord(communityIdMessageMap, keyword);
  const communityIdMostRecentMessageMap = getMostRecentMessagePerMember(communityIdMessageWithWordMap);
  const idsToInstgramHandleVote = getIdToVoteHandleMap(communityIdMostRecentMessageMap, keyword);
  const idToFanIdAndVote: { [communityId: string]: { fanId: string; igHandle: string; timestamp: Date } } = {};
  Object.keys(idsToInstgramHandleVote).forEach((communityId) => {
    const fanId = communityIdToFanSubscriptionId[communityId];
    const vote = idsToInstgramHandleVote[communityId];
    idToFanIdAndVote[communityId] = { fanId, ...vote };
  });

  return idToFanIdAndVote;
}

function hasWordAfterKeyword(str: string, keyword: string) {
  str = str.replace(/^\s+|\s+$/g, "");
  const index = str.indexOf(keyword);
  if (index === -1) {
    return false;
  } else if (index + keyword.length === str.length) {
    return false;
  } else {
    return true;
  }
}

async function main() {
  // const response = await dm("58704615-37e5-4148-804c-e675f5107968", "gm gm");
  const votingOpened = new Date("2022-12-05T18:30:00.000");
  const dateSince = new Date("2022-12-06T11:20:00.000");
  await followUpOnConversations(votingOpened, false);
}

async function followUpOnConversations(dateSince: Date, autoFollowUp: boolean = false) {
  const community_ids = await get_community_ids_that_messaged_since_date(dateSince);
  const communityIdToFanSubscriptionId: { [communityId: string]: string } = {};
  community_ids.forEach((member) => {
    communityIdToFanSubscriptionId[member.communityId] = member.fanSubscriptionId;
  });

  // console.log(community_ids, community_ids.length);
  const ids = community_ids.map((c) => c.communityId);
  console.log("Found", ids.length, "community ids");
  const communityIdMessageMap = await getCommunityIdMessageMapSinceDate(ids, dateSince, "both");
  const followUps: ConversationFollowUp[] = [];

  for (const communityId in communityIdMessageMap) {
    let flups = checkConversation(communityId, communityIdMessageMap[communityId]);
    followUps.push(...flups);
  }

  const payload: MessagePayload[] = [];
  for (const followUp of followUps) {
    if (followUp.type === "VOTED WITHOUT EVER SENDING RESPONSE") {
      payload.push({
        communityId: followUp.communityId,
        text: SUCCESSFUL_VOTE_RESPONSE(followUp.vote),
        fanId: communityIdToFanSubscriptionId[followUp.communityId],
      });
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
    await sendMessages(payload);
  }

  console.log("communityIdToFollowUps", JSON.stringify(communityIdToFollowUps, null, 2));
  console.log("messages", payload.length);
  console.log("users", Object.keys(communityIdToFollowUps).length);
}

type ConversationFollowUp = {
  type: "VOTED WITHOUT NEW RESPONSE" | "VOTED WITHOUT EVER SENDING RESPONSE";
  communityId: string;
  voteTimestamp: Date;
  messageText: string;
  vote: string;
  communityUrl: string;
};

function checkConversation(cid: string, conversation: CommunityMessage[]) {
  const followUps: ConversationFollowUp[] = [];
  const toCommunityMessages = conversation.filter((m) => m.inbound);
  const fromCommunityMessages = conversation.filter((message) => !message.inbound);

  const mostRecentInboundMessage = getMostRecentMessage(conversation, "inbound");
  const voteMessages = getKeywordMessages({ id: toCommunityMessages }, "vote: ");

  const voteMessagesArr = voteMessages["id"] ? voteMessages["id"] : [];

  const mostRecentVoteMessage = getMostRecentMessage(voteMessagesArr, "inbound");
  const mostRecentOutboundMessage = getMostRecentMessage(conversation, "outbound");

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

  voteMessagesAfterOutbound.forEach((voteMessage) => {
    const handle = getVote(voteMessage, "vote: ");
    if (!mostRecentOutboundMessage) {
      followUps.push({
        type: "VOTED WITHOUT EVER SENDING RESPONSE",
        communityId: cid,
        vote: handle.igHandle,
        voteTimestamp: new Date(voteMessage.created_at),
        messageText: voteMessage.text,
        communityUrl: `https://dashboard.community.com/messages/inbox/${cid}`,
      });
    } else {
      followUps.push({
        type: "VOTED WITHOUT NEW RESPONSE",
        communityId: cid,
        vote: handle.igHandle,
        voteTimestamp: new Date(voteMessage.created_at),
        messageText: voteMessage.text,
        communityUrl: `https://dashboard.community.com/messages/inbox/${cid}`,
      });
    }
  });

  return followUps;
}

export type MessagePayload = {
  fanId: string;
  text: string;
  communityId: string;
};

export async function sendMessages(payload: MessagePayload[]) {
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

main();
