import { Leaderboard } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import { loadRank } from "../api/rank";
import { prisma } from "../../server/prisma";
import { DEFAULT_LEADERBOARD_ID } from "../../client/constants";
import LeaderboardPage from "../../components/LeaderboardPage";

const pageSize = 20;

export const serializeLeaderboard = (leaderboard: Leaderboard) => {
  return {
    ...leaderboard,
    startTime: new Date(leaderboard.startTime).toISOString(),
    endTime: new Date(leaderboard.endTime).toISOString(),
    lastCachedAt: leaderboard.lastCachedAt ? new Date(leaderboard.lastCachedAt).toISOString() : null,
  };
};

type SerializedLeaderboard = ReturnType<typeof serializeLeaderboard>;

export const deserializeLeaderboard = (leaderboard: SerializedLeaderboard) => {
  return {
    ...leaderboard,
    startTime: new Date(leaderboard.startTime),
    endTime: new Date(leaderboard.endTime),
    lastCachedAt: leaderboard.lastCachedAt ? new Date(leaderboard.lastCachedAt) : null,
  };
};

export type LeaderboardProps = {
  props: {
    initialRows: {
      rank: number;
      instagramHandle: string;
      rankDirection: string;
    }[];
    leaderboard: SerializedLeaderboard | null;
  };
};

export const getServerSideProps = async (): Promise<LeaderboardProps> => {
  const results = await loadRank(DEFAULT_LEADERBOARD_ID, 0, pageSize);

  const leaderboard = await prisma.leaderboard.findUnique({
    where: {
      id: DEFAULT_LEADERBOARD_ID,
    },
  });

  return {
    props: {
      initialRows: results,
      leaderboard: leaderboard ? serializeLeaderboard(leaderboard) : null,
    },
  };
};

const DefaultLeaderboard = ({ initialRows, leaderboard }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (!leaderboard)
    return (
      <div>
        <h1>Leaderboard not found</h1>
      </div>
    );
  else {
    return <LeaderboardPage initialRows={initialRows} leaderboard={deserializeLeaderboard(leaderboard)} />;
  }
};

export default DefaultLeaderboard;
