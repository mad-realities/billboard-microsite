import { BILLBOARD_END_TIME } from "./constants";
import { MessagePayload } from "./controller";
import { Conversation, ConversationService, Message, Vote } from "./ConversationService";
import { getUniqueVotesForCommunityId } from "./db";
import { getLegitimateVotesAndMessages } from "./vote";

export type RegisterKeywordReturnType = {
  dbRecords: { votes: Vote[] };
  messagePayload: MessagePayload[];
};

type KeywordActionFunciton = (keywordMessages: { [id: string]: Conversation }) => Promise<RegisterKeywordReturnType>;

// create a generic function registerKeywords that takes in an array of keywords and a function that takes in a keywordMessages object and returns a promise of type T
export const registerKeywords = async (
  keywords: string[],
  messages: {
    [id: string]: Conversation;
  },
  keywordAction: KeywordActionFunciton,
): Promise<RegisterKeywordReturnType> => {
  if (keywords.length > 0) {
    const keywordMessages = ConversationService.getKeywordMessages(messages, keywords[0]);
    return await keywordAction(keywordMessages);
  } else {
    return { dbRecords: { votes: [] }, messagePayload: [] };
  }
};

export const registerVotes = async (keywordMessages: {
  [id: string]: Conversation;
}): Promise<RegisterKeywordReturnType> => {
  const idsToVotes = ConversationService.getVotesFromMessages(keywordMessages, "vote: ");
  return await getLegitimateVotesAndMessages(idsToVotes, BILLBOARD_END_TIME);
};

export async function registerSendVoteMessages(messages: {
  [id: string]: Conversation;
}): Promise<RegisterKeywordReturnType> {
  const sendColonVotesMessages = ConversationService.getMessagesWithSpecificWord(messages, "send:votes");
  const sendVotesMessages = ConversationService.getMessagesWithSpecificWord(messages, "send votes");
  const sendNudesMessages = ConversationService.getMessagesWithSpecificWord(messages, "send nudes");
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

  const sendVoteMessagePayload: MessagePayload[] = [];
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

  return { dbRecords: { votes: [] }, messagePayload: sendVoteMessagePayload };
}
