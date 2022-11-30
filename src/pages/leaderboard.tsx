import Leaderboard from "../components/Leaderboard";
import { InferGetServerSidePropsType } from "next";
import { PrismaClient } from "@prisma/client";
import BillboardButton from "../components/design-system/BillboardButton";
import { useRouter } from "next/router";
import Subheader from "../components/design-system/Subheader";
import { prisma } from "../prisma";

type Props = {
  props: {
    voteCounts: { [voteSlug: string]: number };
    lastUpdated: string | null;
  };
};
export const getServerSideProps = async (): Promise<Props> => {
  // query votes from prisma, group by vote slug and count
  const votes = await prisma.vote.groupBy({
    by: ["instagramHandle"],
    _count: {
      instagramHandle: true,
    },
  });

  // convert to object
  const votesObj = votes.reduce((acc, vote) => {
    acc[vote.instagramHandle] = vote._count.instagramHandle;
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
      voteCounts: votesObj,
      lastUpdated: lastUpdated?.timestamp ? lastUpdated?.timestamp.toString() : null,
    }, // will be passed to the page component as props
  };
};

const LeaderboardPage = ({ voteCounts, lastUpdated }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  // sort votes by count into array
  const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);

  // convert to leaderboard row format
  const sortedRows = sortedVotes.map((vote, index) => ({
    rank: (index + 1).toString(),
    handle: vote[0],
    voteCount: vote[1],
  }));

  return (
    <div className="flex w-full flex-col items-center	gap-2 text-white">
      <Subheader>
        <div className="flex w-full flex-row">
          <div className="text-xs">LEADERBOARD</div>
          <div className="flex-grow"></div>
          <div className="place-items-end">
            <div className="text-xs">00:04:20 UNTIL WINNER CHOSEN</div>
          </div>
        </div>
      </Subheader>

      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow">
          NOMINATE
        </BillboardButton>
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/leaderboard")}>
          WAIT WHAT?
        </BillboardButton>
      </div>
      <div className="w-full grow rounded-lg border-4 border-double border-mr-pink bg-mr-black">
        <Leaderboard sortedRows={sortedRows} />
      </div>
    </div>
  );
};

export default LeaderboardPage;
