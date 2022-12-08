import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { loadRank } from "../api/rank";
import { prisma } from "../../server/prisma";
import { deserializeLeaderboard, LeaderboardProps, serializeLeaderboard } from ".";
import LeaderboardPage from "../../components/LeaderboardPage";

const pageSize = 20;

export const getServerSideProps = async (context: GetServerSidePropsContext): Promise<LeaderboardProps> => {
  try {
    // aggregate votes per handle and return ranking
    const { id } = context.query;
    const leaderboardId = parseInt(id as string);

    const results = await loadRank(leaderboardId, 0, pageSize);

    const leaderboard = await prisma.leaderboard.findUnique({
      where: {
        id: leaderboardId,
      },
    });

    return {
      props: {
        initialRows: results,
        leaderboard: leaderboard ? serializeLeaderboard(leaderboard) : null,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      props: {
        initialRows: [],
        leaderboard: null,
      },
    };
  }
};

const Leaderboard = ({ initialRows, leaderboard }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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

export default Leaderboard;
