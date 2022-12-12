import { Conversation } from "../ConversationService";

export type MessagePayload = {
  text: string;
  communityId: string;
};

export type MessageDirection = "inbound" | "outbound" | "both";

export type Message = {
  created_at: Date;
  id: string;
  inbound: boolean;
  media: string;
  source_type: string;
  status: string;
  text: string;
};

export interface MessagingProvider {
  sendMessage: (payload: MessagePayload) => Promise<boolean>;
  sendMessages: (payload: MessagePayload[], delayMs?: number) => Promise<number>;
  getMessagesSinceDate: (
    conversationDataSince: Date,
    messageHistorySince?: Date,
  ) => Promise<{ [id: string]: Conversation }>;
  getMessagesBetweeenDates: (
    conversationStart: Date,
    conversationEnd: Date,
    messageHistorySinceDate?: Date,
  ) => Promise<{ [id: string]: Conversation }>;
}

export type MessageMap = {
  [senderId: string]: Conversation;
};
