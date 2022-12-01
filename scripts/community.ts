import fetch from "node-fetch";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

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
  inbound: string;
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

async function get_community_ids_that_messaged_since_date(since_date: Date) {
  const chats = await get_50_latest_chats();
  const community_ids = get_community_ids_that_messaged_since_date_from_chats(since_date, chats["data"]);
  if (community_ids.length == 50) console.log("More than 50 chats since", since_date);
  return community_ids;
}

async function get_50_latest_chats(): Promise<ChatsResponse> {
  const url = "https://api.community.com/client-dashboard/messaging/chats?page_number=1&page_size=50";
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

async function get_inbound_message_history_since_date(community_id: string, since_date: Date) {
  const msg_history = await get_message_history(community_id);
  const msgs: any[] = msg_history["data"];
  const inbound_messages_since_date = msgs
    .map((msg) => {
      if (new Date(msg["created_at"]) > since_date && msg["inbound"] === true) {
        return msg;
      } else {
        return null;
      }
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
    const messages = await get_inbound_message_history_since_date(member["communityId"], dateSince);
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
) {
  const ids_to_messages_with_word: {
    [community_id: string]: CommunityMessage[];
  } = {};
  Object.keys(ids_to_messages).forEach((community_id) => {
    const messages = ids_to_messages[community_id];
    const messages_with_word = messages.filter((msg) =>
      msg.text
        // remove extra spaces and lowercase
        .replace(/^\s+|\s+$/g, "")
        .toLowerCase()
        .includes(word.toLowerCase()),
    );
    ids_to_messages_with_word[community_id] = messages_with_word;
  });
  return ids_to_messages_with_word;
}

const getMostRecentMessage = (messages: CommunityMessage[]) => {
  const sortedMessages = messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return sortedMessages[0];
};

async function getCommunityIdMessageMapSinceDate(communityIds: string[], dateSince: Date) {
  const communityIdMessageMap: { [communityId: string]: CommunityMessage[] } = {};
  for (const cid of communityIds) {
    const messages = await get_inbound_message_history_since_date(cid, dateSince);
    communityIdMessageMap[cid] = messages;
  }
  return communityIdMessageMap;
}

function getIdToVoteHandleMap(mostRecentMessages: { [communityId: string]: CommunityMessage }, keyword: string) {
  const idsToInstgramHandleVote: { [communityId: string]: { igHandle: string; timestamp: Date } } = {};
  Object.keys(mostRecentMessages).forEach((community_id) => {
    if (mostRecentMessages[community_id]) {
      const message = mostRecentMessages[community_id];
      const messageText = message.text;
      const vote = messageText
        // remove extra spaces and lowercase
        .replace(/^\s+|\s+$/g, "")
        .toLowerCase()
        .split(keyword)[1];
      idsToInstgramHandleVote[community_id] = { igHandle: vote, timestamp: new Date(message.created_at) };
    }
  });
  return idsToInstgramHandleVote;
}

function getMostRecentMessagePerMember(communityIdMessageMap: { [communityId: string]: CommunityMessage[] }) {
  const communityIdMostRecentMessageMap: { [communityId: string]: CommunityMessage } = {};
  Object.keys(communityIdMessageMap).forEach((cid) => {
    const messages = communityIdMessageMap[cid];
    const mostRecentMessage = getMostRecentMessage(messages);
    communityIdMostRecentMessageMap[cid] = mostRecentMessage;
  });
  return communityIdMostRecentMessageMap;
}

export async function getVotesSinceDate(dateSince: Date, keyword = "vote: ") {
  // includes fan subscription id and community id
  const community_ids = await get_community_ids_that_messaged_since_date(dateSince);
  const communityIdToFanSubscriptionId: { [communityId: string]: string } = {};
  community_ids.forEach((member) => {
    communityIdToFanSubscriptionId[member.communityId] = member.fanSubscriptionId;
  });
  const communityIds = community_ids.map((c) => c.communityId);
  const communityIdMessageMap = await getCommunityIdMessageMapSinceDate(communityIds, dateSince);
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

async function main() {
  const dateSince = addDays(new Date(), -1);
  // const community_ids = await get_community_ids_that_messaged_since_date(dateSince);

  const voteMap = await getVotesSinceDate(dateSince);
  console.log("voteMap", voteMap);
  // await triggerCommunityMessageZap(payload);
}
