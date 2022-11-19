import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "./design-system";
import { useRouter } from "next/router";
import { SQUAD } from "../client/constants";

const Leaderboard = () => {
  const [vote, setVote] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="flex flex-col divide-y divide-mr-sky-blue">
        {Object.keys(SQUAD).map((squadMembeId) => (
          <LeaderboardRow onClick={() => setVote(squadMembeId)} id={squadMembeId} votedFor={squadMembeId === vote} />
        ))}
      </div>
    </div>
  );
};

interface LeaderboardRowProps {
  id: string;
  onClick: () => void;
  votedFor: boolean;
}

const LeaderboardRow = ({ onClick, id, votedFor }: LeaderboardRowProps) => {
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
      </div>
      <div className={`${padding} content-end text-right`}>
        <Button color={votedFor ? "mr-pink" : "mr-sky-blue"} size="lg" onPress={onClick}>
          Vote
        </Button>
      </div>
    </div>
  );
};

export default Leaderboard;
