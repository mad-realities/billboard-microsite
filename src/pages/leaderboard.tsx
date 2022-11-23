import Leaderboard from "../components/Leaderboard";
import { InferGetServerSidePropsType } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Props = {
  props: {
    votes: { [voteSlug: string]: number };
    lastUpdated: string | null;
  };
};
export const getServerSideProps = async (): Promise<Props> => {
  // query votes from prisma, group by vote slug and count
  const votes = await prisma.vote.groupBy({
    by: ["voteSlug"],
    _count: {
      voteSlug: true,
    },
  });

  // convert to object
  const votesObj = votes.reduce((acc, vote) => {
    acc[vote.voteSlug] = vote._count.voteSlug;
    return acc;
  }, {} as { [voteSlug: string]: number });

  // get last updated date
  const lastUpdated = await prisma.scriptRun.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  });

  return {
    props: {
      votes: votesObj,
      lastUpdated: lastUpdated?.timestamp ? lastUpdated?.timestamp.toString() : null,
    }, // will be passed to the page component as props
  };
};

const LeaderboardPage = ({ votes, lastUpdated }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="flex flex-col items-center gap-10	py-8 text-white">
      <div className="text-4xl text-white">Leaderboard</div>
      {lastUpdated && (
        <p className="text-2xl text-white">
          {" "}
          <>Last Updated: {new Date(lastUpdated).toLocaleTimeString()} </>
        </p>
      )}
      <div className="w-11/12 grow rounded-lg border-4 border-double border-mr-pink bg-mr-black">
        <Leaderboard votes={votes} />
      </div>
    </div>
  );
};

export default LeaderboardPage;
