import { useRouter } from "next/router";
import SmallBillboardButton from "./design-system/SmallBillboardButton";
import { cutOffStringIfTooLong, getSmsHref } from "../client/utils";
import { useWindowSize } from "../client/hooks";

interface LeaderboardProps {
  sortedRows: { rank: string; handle: string }[];
}

const Leaderboard = ({ sortedRows }: LeaderboardProps) => {
  return (
    <div className="w-full">
      <div className="flex flex-col divide-y divide-mr-sky-blue">
        {sortedRows.map((id) => (
          <InstagramLeaderboardRow key={id.handle} id={id.handle} rank={id.rank} />
        ))}
      </div>
    </div>
  );
};

interface LeaderboardRowProps {
  id: string;
  votedFor: boolean;
  voteCount?: number;
  rank: string;
}

export const InstagramLeaderboardRow = ({ id, rank }: Omit<LeaderboardRowProps, "votedFor">) => {
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
      </div>
      <div className={`${padding} flex-3`}>
        <a href={getSmsHref(id)} className="w-full">
          <SmallBillboardButton color={"mr-sky-blue"} fill>
            Vote
          </SmallBillboardButton>
        </a>
      </div>
    </div>
  );
};

export default Leaderboard;
