import Head from "next/head";
import { ordinal_suffix_of } from "./client/utils";

const hostname = "https://billboard-microsite.vercel.app";
export const LINK_PREVIEW_CONFIG = {
  LANDING: {
    title: "MAD FAMOUS: THE BILLBOARD",
    image: "/mad_famous_link_preview.png",
    description: "",
    url: `${hostname}/`,
  },
  LEADERBOARD: {
    title: "MAD FAMOUS: THE BILLBOARD",
    description: "The Leaderboard",
    url: `${hostname}/leaderboard`,
    image: "/mad_famous_link_preview.png",
  },
  VOTE: {
    title: "MAD FAMOUS: THE BILLBOARD",
    description: "Vote here!",
    url: `${hostname}/vote`,
    image: "/mad_famous_link_preview.png",
  },
  PROFILE: {
    title: (_handle: string, _rank: number) => {
      if (_rank) {
        return `@${_handle} is in ${ordinal_suffix_of(_rank)} place!`;
      } else {
        return `${_handle} is not on the leaderboard yet!`;
      }
    },
    url: (handle: string) => `${hostname}/profile/${handle}`,
    description: "Text to vote!",
    image: (url: string) => {
      return url;
    },
  },
  RANK: {
    title: "MAD FAMOUS: THE BILLBOARD",
    description: "Check your rank!",
    image: "/mad_famous_link_preview.png",
    url: `${hostname}/`,
  },
};

export function getLinkPreview(
  page: keyof typeof LINK_PREVIEW_CONFIG,
  handle?: string,
  rank?: number,
  imageUrl?: string,
) {
  const config = LINK_PREVIEW_CONFIG[page];

  const url = typeof config.url === "function" ? config.url(handle || "") : config.url;
  const title = typeof config.title === "function" ? config.title(handle || "", rank || 0) : config.title;
  const image =
    typeof config.image === "function" ? config.image(imageUrl || "/mad_famous_link_preview.png") : config.image;

  return (
    <Head>
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      {/* <meta property="fb:app_id" content="your fb app id" /> */}
      <meta property="og:title" content={title} />
      <meta name="twitter:card" content="summary" />
      <meta property="og:description" content={config.description} />
      <meta property="og:image" content={image} />
    </Head>
  );
}
