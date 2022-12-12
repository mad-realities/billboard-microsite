import { CommandReturnType } from "../commands/Command";
import { NO_ACTIVE_LEADERBOARD_RESPONSE, SUCCESSFUL_VOTE_RESPONSE, TOO_LATE_RESPONSE } from "../constants";
import { checkForVote, getLeaderboard } from "./db";
import { instagramVote } from "../instagram";
import { MessagePayload } from "../messaging/MessagingProvider";

export type Vote = {
  vote: string;
  voter: string;
  timestamp: Date;
  leaderboardId: number;
};

export type VoteWithoutLeaderboard = Omit<Vote, "leaderboardId">;

/*
 * This function is used to determine if a vote is valid, and if so, to return a Vote object
 * that can be saved to the database. It checks if the vote is too late and if the vote is invalid.
 */
async function getLegitimateVotes(votes: Vote[]) {
  // remove leading @ from each vote in userVotes
  votes.forEach((vote) => {
    vote.vote = vote.vote.replace("@", "");
  });

  // deduplicate votes by voter and vote
  const dedupedUserVotes = votes.reduce((acc, vote) => {
    const existingVote = acc.find((val) => val.voter === vote.voter && val.vote === vote.vote);
    if (!existingVote) {
      acc.push(vote);
    }
    return acc;
  }, [] as Vote[]);

  const votesForDb: Vote[] = [];
  const tooLateVotes: Vote[] = [];
  const tooEarlyVotes: Vote[] = [];
  const noLeaderboardVotes: Vote[] = [];
  const invalidVotes: Vote[] = [];

  for (const vote of dedupedUserVotes) {
    const igVote = await instagramVote(vote);
    const leaderboard = await getLeaderboard(vote.leaderboardId);

    if (!leaderboard) {
      noLeaderboardVotes.push(vote);
      continue;
    } else {
      const lboardStart = new Date(leaderboard.startTime);
      const leaderboardEnd = new Date(leaderboard.endTime);

      if (igVote) {
        if (new Date(igVote.timestamp) > leaderboardEnd) {
          tooLateVotes.push(igVote);
        } else if (new Date(igVote.timestamp) < lboardStart) {
          tooEarlyVotes.push(igVote);
        } else {
          votesForDb.push(igVote);
        }
      } else {
        invalidVotes.push(vote);
      }
    }
  }

  return { votesForDb, tooLateVotes, invalidVotes, noLeaderboardVotes, tooEarlyVotes };
}

async function getVotesNotInDb(votes: Vote[]) {
  const votesNotInDb: Vote[] = [];
  for (const vote of votes) {
    const response = await checkForVote(vote.voter, vote.vote, vote.leaderboardId);
    if (!response) {
      votesNotInDb.push(vote);
    }
  }
  return votesNotInDb;
}

export async function getMissedVotesAndMessages(votes: Vote[]) {
  const newVotes = await getVotesNotInDb(votes);
  const { votesForDb, tooLateVotes, invalidVotes } = await getLegitimateVotes(newVotes);
  const voteMessagePayload: MessagePayload[] = [...getVoteMessages(votesForDb)];
  return { dbRecords: { votes: votesForDb }, messagePayload: voteMessagePayload };
}

export async function getLegitimateVotesAndMessages(votes: Vote[]): Promise<CommandReturnType> {
  const { votesForDb, tooLateVotes, invalidVotes } = await getLegitimateVotes(votes);
  const voteMessagePayload: MessagePayload[] = [
    ...getVoteMessages(votesForDb),
    ...getTooLateMessages(tooLateVotes),
    ...getInvalidVoteMessages(invalidVotes),
  ];
  return { dbRecords: { votes: votesForDb }, messagePayload: voteMessagePayload };
}

function getTooLateMessages(tooLateVotes: Vote[]) {
  const tooLateMessages: MessagePayload[] = [];
  tooLateVotes.forEach((val) => {
    tooLateMessages.push({
      communityId: val.voter,
      text: TOO_LATE_RESPONSE(),
    });
  });
  return tooLateMessages;
}

function getVoteMessages(votesForDb: Vote[]) {
  const voteMessages: MessagePayload[] = [];
  const communityIdToVoteCount: { [communityId: string]: boolean } = {};
  const communityIdToVote: { [communityId: string]: string[] } = {};
  votesForDb.forEach((val) => {
    if (!communityIdToVote[val.voter]) {
      communityIdToVote[val.voter] = [];
    }

    if (communityIdToVoteCount[val.voter]) {
      if (!communityIdToVote[val.voter].includes(val.vote)) {
        communityIdToVote[val.voter].push(val.vote);
        voteMessages.push({
          communityId: val.voter,
          text: SUCCESSFUL_VOTE_RESPONSE(val.vote),
        });
      }
    } else {
      communityIdToVoteCount[val.voter] = true;
      communityIdToVote[val.voter].push(val.vote);
      voteMessages.push({
        communityId: val.voter,
        text: SUCCESSFUL_VOTE_RESPONSE(val.vote),
      });
    }
  });
  return voteMessages;
}

function getInvalidVoteMessages(invalidVotes: Vote[]) {
  const invalidMessages: MessagePayload[] = [];
  invalidVotes.forEach((val) => {
    invalidMessages.push({
      communityId: val.voter,
      text: `@${val.vote} is not a valid Instagram handle.`,
    });
  });
  return invalidMessages;
}

export function getNoLeaderboardMessage(votes: VoteWithoutLeaderboard[]) {
  const msgs: MessagePayload[] = [];
  votes.forEach((val) => {
    msgs.push({
      communityId: val.voter,
      text: NO_ACTIVE_LEADERBOARD_RESPONSE(),
    });
  });
  return msgs;
}
