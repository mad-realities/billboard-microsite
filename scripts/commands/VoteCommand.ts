import { ConversationService } from "../ConversationService";
import { getLeaderboardVotes } from "../db/leaderboard";
import { MessageMap } from "../messaging/MessagingProvider";
import { getLegitimateVotesAndMessages, getNoLeaderboardMessage } from "../db/vote";
import Command, { CommandReturnType } from "./Command";

export default class VoteCommand extends Command {
  toString(): string {
    return "Vote Command";
  }

  async apply(messages: MessageMap): Promise<CommandReturnType> {
    const idsToVotes = ConversationService.getVotesFromMessages(messages, this.keywords);
    const { votes, noLeaderboardVotes } = await getLeaderboardVotes(Object.values(idsToVotes).flat());

    // get responses to votes that didn't apply to a leaderboard
    const noLeaderboardResponses = getNoLeaderboardMessage(noLeaderboardVotes);

    const { dbRecords, messagePayload } = await getLegitimateVotesAndMessages(votes);
    return {
      dbRecords: { ...dbRecords },
      messagePayload: [...messagePayload, ...noLeaderboardResponses],
    };
  }

  keywords: string[];

  constructor(keywords: string[]) {
    super(keywords); // must call super()
    this.keywords = keywords;
  }
}
