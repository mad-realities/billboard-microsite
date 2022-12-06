type Message = {
  created_at: Date;
  id: string;
  inbound: boolean;
  media: string;
  source_type: string;
  status: string;
  text: string;
};

type Conversation = Message[];

export const ConversationService = {
  getMessagesWithSpecificWord: (
    ids_to_messages: { [id: string]: Conversation },
    word: string,
    needsFollowUpWord: boolean = false,
  ) => {
    const ids_to_messages_with_word: { [id: string]: Conversation } = {};

    Object.keys(ids_to_messages).forEach((community_id) => {
      const messages = ids_to_messages[community_id];
      const messages_with_word = messages.filter((msg) => {
        if (msg.text) {
          const messageText = msg.text.replace(/^\s+|\s+$/g, "").toLowerCase();

          if (needsFollowUpWord) {
            return (
              messageText.includes(word.toLowerCase()) && ConversationService.hasWordAfterKeyword(messageText, word)
            );
          } else {
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
};
