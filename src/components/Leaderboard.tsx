import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "./design-system";
import { useRouter } from "next/router";
import { CONTACT_PHONE_NUMBER, SQUAD } from "../client/constants";
import SmallBillboardButton from "./design-system/SmallBillboardButton";

interface LeaderboardProps {
  sortedRows: { rank: string; handle: string }[];
}

const Leaderboard = ({ sortedRows }: LeaderboardProps) => {
  const [vote, setVote] = useState<string | null>(null);

  const onVote = (id: string) => {
    console.log(navigator.userAgent);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col divide-y divide-mr-sky-blue">
        {sortedRows.map((id) => (
          <InstagramLeaderboardRow key={id.handle} onClick={() => onVote(id.handle)} id={id.handle} rank={id.rank} />
        ))}
      </div>
    </div>
  );
};

interface LeaderboardRowProps {
  id: string;
  onClick: () => void;
  votedFor: boolean;
  voteCount?: number;
  rank: string;
}

const InstagramLeaderboardRow = ({ onClick, id, rank }: Omit<LeaderboardRowProps, "votedFor">) => {
  const router = useRouter();
  const padding = "p-2";

  const idStringLength = id.length;
  const handleClasses = idStringLength > 20 ? "text-xs break-words" : idStringLength > 15 ? "text-sm" : "text-md";

  return (
    <div className="flex w-full flex-row hover:bg-mr-navy">
      <div className="flex flex-1 flex-row items-center" onClick={() => router.push(`/profile/${id}`)}>
        <div className={`${padding} text-left text-sm`}>#{rank}</div>
        <div className={`${padding} text-md flex-1 text-left ${handleClasses}`}>@{id}</div>
      </div>
      <div className={`${padding} flex-3`}>
        <a href={`sms:${CONTACT_PHONE_NUMBER}?&body=VOTE:${id}`} className="w-full">
          <SmallBillboardButton color={"mr-sky-blue"} fill>
            Vote
          </SmallBillboardButton>
        </a>
      </div>
    </div>
  );
};

const LeaderboardRow = ({ onClick, id, votedFor, voteCount }: LeaderboardRowProps) => {
  const router = useRouter();
  const padding = "p-2";

  const image = SQUAD[id].image;
  const name = SQUAD[id].name;

  return (
    <div className="flex w-full flex-row items-center hover:bg-mr-navy">
      <div className="group flex w-full flex-row items-center " onClick={() => router.push(`/profile/${id}`)}>
        <div className={`${padding} text-left `}>
          <Image src={image} alt="Mad Realities wordmark logo" width={100} height={100} />
        </div>

        <div className={`${padding} grow text-left text-2xl`}>{name}</div>
        <div>
          <p className={`text-xl`}>Votes: {voteCount}</p>
        </div>
      </div>
      <div className={`${padding} flex flex-row content-end text-right`}>
        <a href={`sms:${CONTACT_PHONE_NUMBER}?&body=VOTE:${id}`}>
          <Button color={votedFor ? "mr-pink" : "mr-sky-blue"} size="lg">
            Vote
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Leaderboard;
