import { useRouter } from "next/router";
import { CONTACT_PHONE_NUMBER, SQUAD } from "../../../client/constants";
import { Button } from "../../../components/design-system";
import { useWindowSize } from "../../../client/hooks";
import BillboardButton from "../../../components/design-system/BillboardButton";
import Subheader from "../../../components/design-system/Subheader";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { prisma } from "../../../prisma";
import { cutOffStringIfTooLong, getSmsHref, ordinal_suffix_of } from "../../../client/utils";
import { RWebShare } from "react-web-share";
import { loadRankForHandle } from "../../api/rank";

type Props = {
  props: {
    hasVote: boolean;
    rank: number;
    handle: string;
    prompt: string;
    hostname: string;
  };
};

export const getServerSideProps = async (context: GetServerSidePropsContext): Promise<Props> => {
  // aggregate votes per handle and return ranking
  const { id } = context.query;
  const hostname = context.req.headers.host;

  const rank = await loadRankForHandle(id as string);
  // const votes = await prisma.vote.groupBy({
  //   by: ["instagramHandle"],
  //   _count: {
  //     instagramHandle: true,
  //   },
  //   orderBy: {
  //     _count: {
  //       instagramHandle: "desc",
  //     },
  //   },
  // });

  // const rank = votes.findIndex((vote) => vote.instagramHandle === id) + 1;

  return {
    props: {
      rank: rank ? rank.rank : 0,
      handle: id as string,
      hasVote: rank ? true : false,
      prompt: "MOST ELIGIBLE BACHELOR",
      hostname: hostname || "",
    }, // will be passed to the page component as props
  };
};

const ProfileCard = ({
  rank,
  handle,
  hasVote,
  prompt,
  hostname,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const margin = "m-5";
  const router = useRouter();
  console.log(`${hostname}/profile/${handle}`);

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
          <a href={`https://instagram.com/${handle}`} target="_blank" rel="noreferrer">
            <span className="text-mr-yellow underline">@{cutOffStringIfTooLong(handle, 15)}</span>
          </a>
          <span> {hasVote ? "is in..." : "has"}</span>
        </div>

        {hasVote ? (
          <>
            <div className="text-center text-6xl">{ordinal_suffix_of(rank)}</div>
            <div className="text-center">
              <span className="">for </span>
              <span className="font-bold">{prompt}</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-center text-6xl">No Votes :(</div>
            <div className="text-center">
              <span className="">for </span>
              <span className="font-bold">{prompt}</span>
            </div>
          </>
        )}

        <div className="flex w-full flex-row gap-2">
          <BillboardButton fill color="mr-sky-blue">
            <a href={getSmsHref(handle)}>VOTE</a>
          </BillboardButton>
          <RWebShare
            data={{
              // text: "Like humans, flamingos make friends for life",
              url: `https://${hostname}/profile/${handle}`,
              // title: "Share this article on Flamingos",
            }}
            // onClick={() => router.push("/leaderboard")}
          >
            <BillboardButton fill color="mr-sky-blue">
              SHARE
            </BillboardButton>
          </RWebShare>
        </div>
      </div>
    </div>
  );
};
export default ProfileCard;
