import Head from "next/head";

const hostname = "https://billboard-microsite.vercel.app";
export const LINK_PREVIEW_CONFIG = {
  LANDING: {
    title: "MAD FAMOUS: THE BILLBOARD",
    image: "/cabs.png",
    description: "",
    url: `${hostname}/`,
  },
  LEADERBOARD: {
    title: "MAD FAMOUS: THE BILLBOARD",
    description: "The Leaderboard",
    url: `${hostname}/leaderboard`,
    image: "/cabs.png",
  },
  VOTE: {
    title: "MAD FAMOUS: THE BILLBOARD",
    description: "Vote here!",
    url: `${hostname}/vote`,
    image: "/cabs.png",
  },
  PROFILE: {
    title: (handle: string, rank: number) => "MAD FAMOUS: THE BILLBOARD",
    url: (handle: string) => `${hostname}/profile/${handle}`,
    description: "Text to vote!",
    image: "/cabs.png",
  },
  RANK: {
    title: "MAD FAMOUS: THE BILLBOARD",
    description: "Check your rank!",
    image: "/cabs.png",
    url: `${hostname}/`,
  },
};

export function getLinkPreview(page: keyof typeof LINK_PREVIEW_CONFIG, handle?: string, rank?: number) {
  const config = LINK_PREVIEW_CONFIG[page];

  const url = typeof config.url === "function" ? config.url(handle || "") : config.url;
  const title = typeof config.title === "function" ? config.title(handle || "", rank || 0) : config.title;

  return (
    <Head>
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      {/* <meta property="fb:app_id" content="your fb app id" /> */}
      <meta property="og:title" content={title} />
      <meta name="twitter:card" content="summary" />
      <meta property="og:description" content={config.description} />
      <meta property="og:image" content="/cabs.png" />
    </Head>
  );
}
