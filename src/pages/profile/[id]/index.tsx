import { useRouter } from "next/router";
import BillboardButton from "../../../components/design-system/BillboardButton";
import Subheader from "../../../components/design-system/Subheader";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { cutOffStringIfTooLong, getSmsHref, ordinal_suffix_of } from "../../../client/utils";
import { RWebShare } from "react-web-share";
import { loadRankForHandle } from "../../api/rank";
import { getLinkPreview } from "../../../linkPreviewConfig";
import { getLinkPreviewUrl } from "../../api/preview";
import { useEffect } from "react";
import { CLICKED_SHARE, CLICKED_VOTE, mixpanelClient, VISITED_PROFILE } from "../../../client/mixpanel";
import { DEFAULT_LEADERBOARD_ID } from "../../../client/constants";

type Props = {
  redirect?: {
    permanent: boolean;
    destination: string;
  };
  props: {
    hasVote: boolean;
    rank: number;
    handle: string;
    prompt: string;
    hostname: string;
    linkPreviewUrl: string;
  };
};

export const getServerSideProps = async (context: GetServerSidePropsContext): Promise<Props> => {
  // aggregate votes per handle and return ranking
  const { id } = context.query;
  const hostname = context.req.headers.host;

  const removeLeadingAt = id && id.toString().replace("@", "");

  if (removeLeadingAt !== id) {
    return {
      redirect: {
        permanent: true,
        destination: `/profile/${removeLeadingAt}`,
      },
      props: {
        rank: 0,
        handle: id as string,
        hasVote: false,
        prompt: "MOST LIKELY TO BE ON A BILLBOARD IN TIMES SQUARE",
        hostname: hostname || "",
        linkPreviewUrl: "",
      },
    };
  }

  const rank = await loadRankForHandle(DEFAULT_LEADERBOARD_ID, id as string);
  const linkPreviewUrl = await getLinkPreviewUrl(id as string, context.req.headers.host as string);

  return {
    props: {
      rank: rank ? rank.rank : 0,
      handle: id as string,
      hasVote: rank ? true : false,
      prompt: "MOST LIKELY TO BE ON A BILLBOARD IN TIMES SQUARE",
      hostname: hostname || "",
      linkPreviewUrl: linkPreviewUrl,
    }, // will be passed to the page component as props
  };
};

const ProfileCard = ({
  rank,
  handle,
  hasVote,
  prompt,
  hostname,
  linkPreviewUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const url = `https://${hostname}/profile/${handle}`;
  const linkPreview = getLinkPreview("PROFILE", handle, rank, linkPreviewUrl);
  console.log(linkPreviewUrl);

  const text = (
    <>
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
    </>
  );

  useEffect(() => {
    mixpanelClient.track(VISITED_PROFILE, {
      username: handle,
      rank: rank,
      hasVote: hasVote,
    });
  }, [handle, rank, hasVote]);

  function clickedShare() {
    mixpanelClient.track(CLICKED_SHARE);
  }

  function clickedVote() {
    mixpanelClient.track(CLICKED_VOTE, {
      username: handle,
      rank: rank,
      hasVote: hasVote,
    });
  }

  return (
    <div className="flex grow flex-col items-center gap-2 rounded-xl text-3xl">
      {linkPreview}
      <Subheader>
        <div>PERSONAL PROFILE</div>
      </Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/vote")}>
          NOMINATE
        </BillboardButton>
        <BillboardButton fill color="transparent" onPress={() => router.push("/leaderboard")}>
          LEADERBOARD
        </BillboardButton>
      </div>
      <div className="align-center m-2 flex flex-col items-center justify-center gap-4 rounded-xl border border-white p-5">
        {text}
        <div className="flex w-full flex-row gap-2">
          <a href={getSmsHref(handle)} onClick={clickedVote} className="flex-grow">
            <BillboardButton fill color="mr-sky-blue">
              VOTE
            </BillboardButton>
          </a>
          <div className="flex-grow">
            <RWebShare
              data={{
                // text: "Like humans, flamingos make friends for life",
                url,
                // title: "Share this article on Flamingos",
              }}
              onClick={() => clickedShare()}
            >
              <BillboardButton fill color="mr-sky-blue">
                SHARE
              </BillboardButton>
            </RWebShare>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileCard;
