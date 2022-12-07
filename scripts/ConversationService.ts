export type Message = {
  created_at: Date;
  id: string;
  inbound: boolean;
  media: string;
  source_type: string;
  status: string;
  text: string;
};

export type Vote = {
  vote: string;
  voter: string;
  timestamp: Date;
};

export type Conversation = Message[];

export type MessageDirection = "inbound" | "outbound" | "both";

export const ConversationService = {
  getMessagesWithSpecificWord: (
    ids_to_messages: { [id: string]: Conversation },
    word: string,
    needsFollowUpWord: boolean = false,
  ) => {
    const ids_to_messages_with_word: { [id: string]: Message[] } = {};

    Object.keys(ids_to_messages).forEach((community_id) => {
      const messages = ids_to_messages[community_id];
      const messages_with_word = messages.filter((msg) => {
        if (msg.text) {
          const messageText = msg.text.replace(/^\s+|\s+$/g, "").toLowerCase();

          if (needsFollowUpWord) {
            return (
              messageText.includes(word.toLowerCase()) &&
              ConversationService.hasWordAfterKeyword(messageText, word.toLowerCase())
            );
          } else {
            console.log(messageText, word, messageText.includes(word.toLowerCase()));
            return messageText.includes(word.toLowerCase());
          }
        }
      });

      ids_to_messages_with_word[community_id] = messages_with_word;
    });
    return ids_to_messages_with_word;
  },
  hasWordAfterKeyword: (str: string, keyword: string) => {
    str = str.replace(/^\s+|\s+$/g, "");
    const index = str.indexOf(keyword);
    if (index === -1) {
      return false;
    } else if (index + keyword.length === str.length) {
      return false;
    } else {
      return true;
    }
  },
  getMostRecentMessage: (messages: Conversation, direction: MessageDirection = "both") => {
    let mostRecentMessage: Message | null = null;
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
    return mostRecentMessage as Message | null;
  },
  getMostRecentMessageMap: (conversationMap: { [id: string]: Conversation }, direction: MessageDirection = "both") => {
    const recentMessageMap: { [id: string]: Message } = {};
    Object.keys(conversationMap).forEach((cid) => {
      const messages = conversationMap[cid];
      const mostRecentMessage = ConversationService.getMostRecentMessage(messages, direction);
      if (mostRecentMessage) {
        recentMessageMap[cid] = mostRecentMessage;
      }
    });
    return recentMessageMap;
  },
  getKeywordMessages: (
    communityIdMessageMap: { [communityId: string]: Message[] },
    keyword: string,
    needsFollowUpWord: boolean = false,
  ) => {
    const communityIdMessageWithWordMap = ConversationService.getMessagesWithSpecificWord(
      communityIdMessageMap,
      keyword,
      needsFollowUpWord,
    );
    return communityIdMessageWithWordMap;
  },
  getVote: (message: Message, voteKeyword: string) => {
    const messageText = message.text;
    const vote = messageText
      // remove extra spaces and lowercase
      .replace(/^\s+|\s+$/g, "")
      .toLowerCase()
      .split(voteKeyword)[1];
    return { vote: vote, timestamp: new Date(message.created_at) };
  },
  getVoteMap: (messages: { [id: string]: Message }, voteKeyword: string) => {
    const idToVote: { [id: string]: Vote } = {};
    Object.keys(messages).forEach((id) => {
      const message = messages[id];
      const vote = { voter: id, ...ConversationService.getVote(message, voteKeyword) };
      idToVote[id] = vote;
    });

    return idToVote;
  },
  getVotesMap: (messages: { [id: string]: Conversation }, voteKeyword: string) => {
    const idToVote: { [id: string]: Vote[] } = {};
    Object.keys(messages).forEach((id) => {
      const messagesWithKeyword = messages[id];
      const votes = messagesWithKeyword.map((message) => {
        return { voter: id, ...ConversationService.getVote(message, voteKeyword) };
      });
      idToVote[id] = votes;
    });

    return idToVote;
  },
  getVotesFromMessages: (conversationMap: { [id: string]: Conversation }, voteKeyword = "vote: ") => {
    const communityIdMessageWithWordMap = ConversationService.getMessagesWithSpecificWord(
      conversationMap,
      voteKeyword,
      true,
    );
    const idsToVotes = ConversationService.getVotesMap(communityIdMessageWithWordMap, voteKeyword);
    return idsToVotes;
  },
  getVoteMapFromMessageMap: (conversationMap: { [id: string]: Message }, voteKeyword = "vote: ") => {
    const idsToVotes = ConversationService.getVoteMap(conversationMap, voteKeyword);
    return idsToVotes;
  },
};
