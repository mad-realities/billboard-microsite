import fetch from "node-fetch";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { incrementCount } from "./datadog";
import { addDays, delay } from "./utils";
import { Conversation, ConversationService, MessageDirection } from "./ConversationService";
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

type MessagePayload = {
  text: string;
  communityId: string;
};

type ChatsResponse = {
  data: any[];
};

export interface MessagingProvider {
  sendMessage: (payload: MessagePayload) => Promise<boolean>;
  sendMessages: (payload: MessagePayload[], delayMs?: number) => Promise<number>;
  getMessagesSinceDate: (dateSince: Date) => Promise<{ [id: string]: Conversation }>;
}

export class CommunityService implements MessagingProvider {
  async sendMessage(payload: MessagePayload) {
    return await this.dm(payload.communityId, payload.text, false);
  }

  async sendMessages(payload: MessagePayload[], delayMs: number = 600) {
    let count = 0;
    for (const message of payload) {
      await delay(delayMs);
      const response = await this.dm(message.communityId, message.text);
      if (response) {
        count++;
      } else {
        console.log("Error sending message", message);
      }
    }

    return count;
  }

  async dm(fanId: string, text: string, shorten_links: boolean = false) {
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
  async get50Chats(page_number: number = 1): Promise<ChatsResponse> {
    const url = `https://api.community.com/client-dashboard/messaging/chats?page_number=${page_number}&page_size=50`;
    const response = await fetch(url, { method: "GET", headers: headers });
    if (response.status !== 200) throw response.statusText;
    return (await response.json()) as ChatsResponse;
  }

  async getCommunityAndFanIdsSinceDate(since_date: Date) {
    let pageNumber = 1;
    const chats = await this.get50Chats(pageNumber);
    const community_ids = this.getCommunityIdsMessagedSinceDateFromChats(since_date, chats["data"]);

    if (community_ids.length == 50) {
      // there are more than 50 chats, so we need to get the rest
      while (true) {
        pageNumber++;
        const next_page_chats = await this.get50Chats(pageNumber);
        community_ids.push(...this.getCommunityIdsMessagedSinceDateFromChats(since_date, next_page_chats["data"]));
        if (next_page_chats["data"].length < 50) {
          break;
        }
      }
    }
    return community_ids;
  }

  getCommunityIdsMessagedSinceDateFromChats(since_date: Date, chats: any[]) {
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

  async getMessageHistory(community_id: string): Promise<MessageHistoryResponse> {
    // For some odd reason, the community web client queries with a date 1 day in the future in UTC
    const queryDate = addDays(new Date(), 1);
    const queryDateString = queryDate.toISOString();
    const url = `https://api.community.com/client-dashboard/v2/edefb05a-ec9b-40ac-a3fd-7b2459d195cb/fans/${community_id}/message-history?end_date=${queryDateString}&page_size=50&tags\[not\]=auto-response`;
    const response = await fetch(url, { method: "GET", headers: headers });
    if (response.status !== 200) throw response.statusText;
    return (await response.json()) as MessageHistoryResponse;
  }

  async getMessageHistorySinceDate(community_id: string, since_date: Date, direction: MessageDirection) {
    const msg_history = await this.getMessageHistory(community_id);
    const msgs: any[] = msg_history["data"];
    const msgarr = msgs
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
    return msgarr;
  }

  async getMessagesSinceDate(dateSince: Date) {
    const communityIds = await this.getCommunityAndFanIdsSinceDate(dateSince);

    // we don't need this map anymore but might be needed in future, used in zapier call
    const communityIdToFanSubscriptionId: { [communityId: string]: string } = {};
    communityIds.forEach((member) => {
      communityIdToFanSubscriptionId[member.communityId] = member.fanSubscriptionId;
    });

    const communityIdsOnly = communityIds.map((member) => member.communityId);
    const communityIdMessageMap = await this.getCommunityIdMessageMapSinceDate(communityIdsOnly, dateSince, "inbound");
    return communityIdMessageMap;
  }

  async getCommunityIdMessageMapSinceDate(
    communityIds: string[],
    dateSince: Date,
    direction: MessageDirection = "both",
  ) {
    const communityIdMessageMap: { [communityId: string]: CommunityMessage[] } = {};
    for (const cid of communityIds) {
      // sleep for random amount of time to avoid rate limiting (max 100 requests per minute)
      await delay(Math.random() * 600);
      console.log("fetching messages for", cid);
      const messages = await this.getMessageHistorySinceDate(cid, dateSince, direction);
      communityIdMessageMap[cid] = messages;
    }
    return communityIdMessageMap;
  }
}
