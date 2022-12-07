import { useRouter } from "next/router";
import SmallBillboardButton from "./design-system/SmallBillboardButton";
import { cutOffStringIfTooLong, getSmsHref } from "../client/utils";
import { useWindowSize } from "../client/hooks";
import { match } from "ts-pattern";
import clsx from "clsx";

interface LeaderboardRowProps {
  id: string;
  votedFor: boolean;
  rankDirection: string;
  voteCount?: number;
  rank: string;
}

export const InstagramLeaderboardRow = ({ id, rank, rankDirection }: Omit<LeaderboardRowProps, "votedFor">) => {
  const router = useRouter();
  const padding = "p-2";

  const windowSize = useWindowSize();

  return (
    <div className="flex w-full max-w-md flex-row hover:bg-mr-navy">
      <div className="flex flex-1 flex-row items-center" onClick={() => router.push(`/profile/${id}`)}>
        <div className={`${padding} text-left text-sm`}>#{rank}</div>
        <div className={`${padding} text-md flex-1 text-left`}>
          @{windowSize.width && windowSize.width > 800 ? id : cutOffStringIfTooLong(id, 20)}
        </div>
        <div>
          {match(rankDirection)
            .with("NEW", () => (
              <span role="img" aria-label="sheep">
                🆕
              </span>
            ))
            .with("UP", () => (
              <span role="img" aria-label="fire">
                🔥
              </span>
            ))
            .with("DOWN", () => (
              <span role="img" aria-label="ice">
                🥺
              </span>
            ))
            .otherwise(() => "")}
        </div>
      </div>
      <div className={`${padding} flex-3`}>
        <a
          href={process.env.NEXT_PUBLIC_LEADERBOARD_DONE ? "#" : getSmsHref(id)}
          className={clsx("w-full", process.env.NEXT_PUBLIC_LEADERBOARD_DONE && "cursor-not-allowed")}
        >
          <SmallBillboardButton color={"mr-sky-blue"} fill disabled={process.env.NEXT_PUBLIC_LEADERBOARD_DONE}>
            Vote
          </SmallBillboardButton>
        </a>
      </div>
    </div>
  );
};
