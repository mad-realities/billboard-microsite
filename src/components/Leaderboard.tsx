import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "./design-system";
import { useRouter } from "next/router";
import { CONTACT_PHONE_NUMBER, SQUAD } from "../client/constants";

interface LeaderboardProps {
  votes: { [key: string]: number };
}

const Leaderboard = ({ votes }: LeaderboardProps) => {
  const [vote, setVote] = useState<string | null>(null);

  const onVote = (id: string) => {
    console.log(navigator.userAgent);
  };

  const sortedList = Object.keys(votes).sort((a, b) => votes[b] - votes[b]);
  console.log("votes", votes, sortedList);
  return (
    <div className="w-full">
      <div className="flex flex-col divide-y divide-mr-sky-blue">
        {sortedList.map((id) => (
          <InstagramLeaderboardRow voteCount={votes[id]} key={id} onClick={() => onVote(id)} id={id} />
        ))}
      </div>
    </div>
  );
};

interface LeaderboardRowProps {
  id: string;
  onClick: () => void;
  votedFor: boolean;
  voteCount: number;
}

const InstagramLeaderboardRow = ({ onClick, id, voteCount }: Omit<LeaderboardRowProps, "votedFor">) => {
  const router = useRouter();
  const padding = "p-2";

  return (
    <div className="flex w-full flex-row items-center hover:bg-mr-navy">
      <div className="group flex w-full flex-row items-center " onClick={() => router.push(`/profile/${id}`)}>
        {/* <div className={`${padding} text-left `}>
          <Image src={image} alt="Mad Realities wordmark logo" width={100} height={100} />
        </div> */}

        <div className={`${padding} grow text-left text-2xl`}>{id}</div>
        <div>
          <p className={`text-xl`}>Votes: {voteCount}</p>
        </div>
      </div>
      <div className={`${padding} flex flex-row content-end text-right`}>
        <a href={`sms:${CONTACT_PHONE_NUMBER}?&body=VOTE:${id}`}>
          <Button color={"mr-sky-blue"} size="lg">
            Vote
          </Button>
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
