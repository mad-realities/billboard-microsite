import { useRouter } from "next/router";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { cutOffStringIfTooLong, getSmsHref, ordinal_suffix_of } from "../../../client/utils";
import { loadRankForHandle } from "../../api/rank";
import { getLinkPreview } from "../../../linkPreviewConfig";
import Image from "next/image";

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
      },
    };
  }

  const rank = await loadRankForHandle(id as string);

  return {
    props: {
      rank: rank ? rank.rank : 0,
      handle: id as string,
      hasVote: rank ? true : false,
      prompt: "MOST LIKELY TO BE ON A BILLBOARD IN TIMES SQUARE",
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
  const router = useRouter();
  const url = `https://${hostname}/profile/${handle}`;
  const linkPreview = getLinkPreview("PROFILE", handle, rank);
  const text = (
    <div className="flex grow flex-col items-center gap-3 rounded-xl">
      <div className="text-3xl">
        <a href={`https://instagram.com/${handle}`} target="_blank" rel="noreferrer">
          <span className="text-mr-yellow underline">@{cutOffStringIfTooLong(handle, 15)}</span>
        </a>
        <span> {hasVote ? "is" : "has"}</span>
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
            <span className="font-bold">{prompt}</span>
          </div>
        </>
      )}
    </div>
  );
  return (
    <div className="flex grow flex-col items-center gap-5 rounded-xl text-3xl">
      <div
        className="text-center"
        style={{
          position: "relative",
          textAlign: "center",
          color: "white",
        }}
      >
        <Image src="/PreviewCard2.png" alt="Link Preview Card" width={800} height={400} style={{ width: "100%" }} />
        <div
          className="text-center"
          style={{
            textAlign: "center",

            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
export default ProfileCard;
