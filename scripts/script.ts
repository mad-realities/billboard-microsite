import fetch from "node-fetch";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config({
  path: ".env.local",
});

function addDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

let headers = {
  Authorization: `Bearer ${process.env.COMMUNITY_TOKEN}`,
  "Content-Type": "application/json",
  //  'Origin': 'https://dashboard.community.com',
  //  'Referer': 'https://dashboard.community.com/',
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
  Accept: "*/*",
  // 'Host': 'api.community.com',
};

function get_community_ids_that_messaged_since_date_from_chats(since_date: Date, chats: any[]) {
  const community_ids: string[] = [];
  chats.forEach((chat) => {
    const last_message_at = new Date(chat["last_msg"]["created_at"]);
    if (last_message_at > since_date) {
      community_ids.push(chat["fan_profile"]["id"]);
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

async function get_50_latest_chats() {
  const url = "https://api.community.com/client-dashboard/messaging/chats?page_number=1&page_size=50";
  const response = await fetch(url, { method: "GET", headers: headers });
  if (response.status !== 200) throw response.statusText;
  return await response.json();
}

async function get_message_history(community_id: string) {
  // For some odd reason, the community web client queries with a date 1 day in the future in UTC
  const queryDate = addDays(new Date(), 1);
  const queryDateString = queryDate.toISOString();
  const url = `https://api.community.com/client-dashboard/v2/edefb05a-ec9b-40ac-a3fd-7b2459d195cb/fans/${community_id}/message-history?end_date=${queryDateString}&page_size=50&tags\[not\]=auto-response`;
  const response = await fetch(url, { method: "GET", headers: headers });
  if (response.status !== 200) throw response.statusText;
  return await response.json();
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

export async function getVotesMapSinceDate(keywords: string[], dateSince: Date) {
  const community_ids = await get_community_ids_that_messaged_since_date(dateSince);
  const ids_to_messages: { [community_id: string]: any } = {};
  for (const community_id of community_ids) {
    const messages = await get_inbound_message_history_since_date(community_id, dateSince);
    ids_to_messages[community_id] = messages;
  }

  const user_keyword_counts: { [communityId: string]: { [keyword: string]: number } } = {};
  Object.keys(ids_to_messages).forEach((community_id) => {
    const keyword_counts = count_keywords_in_text(ids_to_messages[community_id], keywords);
    user_keyword_counts[community_id] = keyword_counts;
  });

  return user_keyword_counts;
}

const keywords = ["VOTE:ALICE"];
const dateSince = addDays(new Date(), -1);
getVotesMapSinceDate(keywords, dateSince);

// for community_id in community_ids:
//     ids_to_messages[community_id] = messages

// # print(ids_to_messages)

// # msg_history = get_inbound_message_history_since_date("34b1fca9-9b09-43e5-b9ef-48aaf2ffe0a8", dateSince)
// # print(msg_history)
