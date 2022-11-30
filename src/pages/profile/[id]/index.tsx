import { useRouter } from "next/router";
import { CONTACT_PHONE_NUMBER, SQUAD } from "../../../client/constants";
import { Button } from "../../../components/design-system";
import { useWindowSize } from "../../../client/hooks";
import BillboardButton from "../../../components/design-system/BillboardButton";
import Subheader from "../../../components/design-system/Subheader";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { prisma } from "../../../prisma";

type Props = {
  props: {
    hasVote: boolean;
    rank: number;
    handle: string;
    prompt: string;
  };
};

function ordinal_suffix_of(i: number) {
  const j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

export const getServerSideProps = async (context: GetServerSidePropsContext): Promise<Props> => {
  // aggregate votes per handle and return ranking
  const { id } = context.query;
  const votes = await prisma.vote.groupBy({
    by: ["instagramHandle"],
    _count: {
      instagramHandle: true,
    },
    orderBy: {
      _count: {
        instagramHandle: "desc",
      },
    },
  });

  const rank = votes.findIndex((vote) => vote.instagramHandle === id) + 1;

  return {
    props: {
      rank: rank,
      handle: id as string,
      hasVote: true,
      prompt: "MOST ELIGIBLE BACHELOR",
    }, // will be passed to the page component as props
  };
};

function cutOffStringIfTooLong(string: string, length: number) {
  if (string.length > length) {
    return string.substring(0, length) + "...";
  }
  return string;
}

const ProfileCard = ({ rank, handle, hasVote, prompt }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const margin = "m-5";
  const router = useRouter();

  return (
    <div className="flex grow flex-col items-center gap-2 rounded-xl text-3xl text-white">
      <Subheader>
        <div>Personal Profile</div>
      </Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/vote")}>
          NOMINATE
        </BillboardButton>
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/leaderboard")}>
          LEADERBOARD
        </BillboardButton>
      </div>
      <div className="align-center m-2 flex flex-col items-center justify-center gap-4 rounded-xl border border-white p-5">
        <div className="text-3xl">
          <a href="">
            <span className="text-mr-yellow underline">@{cutOffStringIfTooLong(handle, 15)}</span>
          </a>
          <span> is in...</span>
        </div>

        <div className="text-center text-6xl">{ordinal_suffix_of(rank)}</div>
        <div className="text-center">
          <span className="">for </span>
          <span className="font-bold">{prompt}</span>
        </div>

        <div className="flex w-full flex-row gap-2">
          <BillboardButton fill color="mr-sky-blue">
            <a href={`sms:${CONTACT_PHONE_NUMBER}?&body=VOTE:${handle}`}>VOTE</a>
          </BillboardButton>
          <BillboardButton fill color="mr-sky-blue" onPress={() => router.push("/leaderboard")}>
            SHARE
          </BillboardButton>
        </div>
      </div>
      {/* <div className={`${margin}`}>
        <Button color={"mr-sky-blue"} size="lg" onPress={() => router.push(`/profile/${id}/edit`)}>
          Edit
        </Button>
      </div> */}
    </div>
  );
};
export default ProfileCard;
