import { ANOTHER_SUCCESSFUL_VOTE_RESPONSE, SUCCESSFUL_VOTE_RESPONSE, TOO_LATE_RESPONSE } from "./constants";
import { MessagePayload } from "./controller";
import { Vote } from "./ConversationService";
import { instagramVote, validInstagramHandle } from "./instagram";
import { RegisterKeywordReturnType } from "./keywordRegisters";

export async function getLegitimateVotesAndMessages(
  idsToVotes: { [id: string]: Vote[] },
  voteEnd: Date,
): Promise<RegisterKeywordReturnType> {
  const allUserVotes = Object.values(idsToVotes).flat();

  // remove leading @ from each vote in userVotes
  allUserVotes.forEach((vote) => {
    vote.vote = vote.vote.replace("@", "");
  });

  // filter out invalid handles
  const validUserVotes = allUserVotes.filter((vote) => validInstagramHandle(vote.vote));

  // deduplicate votes by voter and vote
  const dedupedUserVotes = validUserVotes.reduce((acc, vote) => {
    const existingVote = acc.find((val) => val.voter === vote.voter && val.vote === vote.vote);
    if (!existingVote) {
      acc.push(vote);
    }
    return acc;
  }, [] as Vote[]);

  const votesForDb: Vote[] = [];
  const tooLateVotes: Vote[] = [];

  for (const vote of dedupedUserVotes) {
    const igVote = await instagramVote(vote);
    if (igVote) {
      if (new Date(igVote.timestamp) > voteEnd) {
        tooLateVotes.push(igVote);
      } else {
        votesForDb.push(igVote);
      }
    }
  }

  const communityIdToVoteCount: { [communityId: string]: boolean } = {};
  const communityIdToVote: { [communityId: string]: string[] } = {};
  const voteMessagePayload: MessagePayload[] = [];
  votesForDb.forEach((val) => {
    if (!communityIdToVote[val.voter]) {
      communityIdToVote[val.voter] = [];
    }

    if (communityIdToVoteCount[val.voter]) {
      if (!communityIdToVote[val.voter].includes(val.vote)) {
        communityIdToVote[val.voter].push(val.vote);
        voteMessagePayload.push({
          communityId: val.voter,
          text: ANOTHER_SUCCESSFUL_VOTE_RESPONSE(val.vote),
        });
      }
    } else {
      communityIdToVoteCount[val.voter] = true;
      communityIdToVote[val.voter].push(val.vote);
      voteMessagePayload.push({
        communityId: val.voter,
        text: SUCCESSFUL_VOTE_RESPONSE(val.vote),
      });
    }
  });

  tooLateVotes.forEach((val) => {
    voteMessagePayload.push({
      communityId: val.voter,
      text: TOO_LATE_RESPONSE(),
    });
  });

  return { dbRecords: { votes: votesForDb }, messagePayload: voteMessagePayload };
}
