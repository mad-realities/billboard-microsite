import { ConversationService } from "../ConversationService";
import { getUniqueVotesForCommunityId } from "../db/db";
import { Message, MessageMap, MessagePayload } from "../messaging/MessagingProvider";
import Command, { CommandReturnType } from "./Command";

export default class SendVotesCommand extends Command {
  toString(): string {
    return "Send Vote Command";
  }
  async apply(messages: MessageMap): Promise<CommandReturnType> {
    const allSendVoteMessages = ConversationService.getMessagesWithSpecificWords(messages, this.keywords);
    const sendVoteMessagePayload: MessagePayload[] = [];
    for (const cid of Object.keys(allSendVoteMessages)) {
      if (allSendVoteMessages[cid].length > 0) {
        const votes = await getUniqueVotesForCommunityId(cid);
        const votesString = votes.length ? votes.map((vote) => vote.vote).join("\n@") : "No votes yet";
        sendVoteMessagePayload.push({
          communityId: cid,
          text: `@${votesString}`,
        });
      }
    }

    return { dbRecords: { votes: [] }, messagePayload: sendVoteMessagePayload };
  }

  keywords: string[];

  constructor(keywords: string[]) {
    super(keywords); // must call super()
    this.keywords = keywords;
  }
}
