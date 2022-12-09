import { useState } from "react";
import { BillboardButton } from "./design-system";
import { truncateString, getSmsHref } from "../client/stringUtils";
import { useWindowSize } from "../client/hooks";
import { match } from "ts-pattern";
import clsx from "clsx";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import { Loading } from "../components/design-system";
import { LEADERBOARD_PAGE_SIZE } from "../client/constants";
import { mixpanelClient, SCROLLED_LEADERBOARD } from "../client/mixpanel";

interface LeaderboardRowData {
  rank: number;
  instagramHandle: string;
  rankDirection: string;
}

interface LeaderboardRowProps {
  id: string;
  rankDirection: string;
  voteCount?: number;
  rank: string;
  voteEnabled?: boolean;
}

interface LeaderboardProps {
  initialRows: LeaderboardRowData[];
  endDatetime: Date;
}

const defaultProps = {
  voteEnabled: true,
};

const LeaderboardRow = ({ id, rank, rankDirection, voteEnabled }: LeaderboardRowProps & typeof defaultProps) => {
  const windowSize = useWindowSize();

  return (
    <tr className="align-middle hover:bg-mr-navy">
      <td className="p-2">#{rank}</td>
      <td className="w-full">
        <Link href={`/profile/${id}`} className="hover:underline hover:decoration-solid">
          @{windowSize.width && windowSize.width > 800 ? id : truncateString(id, 20)}
        </Link>
      </td>
      <td>
        {match(rankDirection)
          .with("NEW", () => (
            <span role="img" aria-label="new">
              🆕
            </span>
          ))
          .with("UP", () => (
            <span role="img" aria-label="fire">
              🔥
            </span>
          ))
          .with("DOWN", () => (
            <span role="img" aria-label="plead">
              🥺
            </span>
          ))
          .otherwise(() => "")}
      </td>
      <td className={`flex-3 p-2`}>
        <a href={!voteEnabled ? "#" : getSmsHref(id)} className={clsx("w-full", !voteEnabled && "cursor-not-allowed")}>
          <BillboardButton small color={"mr-sky-blue"} fill disabled={!voteEnabled}>
            Vote
          </BillboardButton>
        </a>
      </td>
    </tr>
  );
};

LeaderboardRow.defaultProps = defaultProps;

export const Leaderboard = ({ initialRows, endDatetime }: LeaderboardProps) => {
  const [hasMore, setHasMore] = useState(true);
  const [rows, setRows] = useState(initialRows);

  const getMore = async () => {
    const res = await fetch(`/api/rank?offset=${rows.length}&limit=${LEADERBOARD_PAGE_SIZE}`);
    const newRowsResponse = await res.json();
    const newRows = newRowsResponse["results"];
    if (newRows.length === 0) {
      setHasMore(false);
      mixpanelClient.track(SCROLLED_LEADERBOARD, {
        hasMore: false,
      });
    } else {
      mixpanelClient.track(SCROLLED_LEADERBOARD, {
        hasMore: true,
      });
      setRows((rows) => [...rows, ...newRows]);
    }
  };

  const currentTime = new Date();

  return (
    <div className="w-full rounded-lg border-4 border-double border-mr-offwhite">
      <InfiniteScroll
        dataLength={rows.length}
        next={getMore}
        hasMore={hasMore}
        loader={<Loading />}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>You have seen it all!</b>
          </p>
        }
      >
        <table className="w-full">
          <tbody>
            {rows.map((row) => (
              <LeaderboardRow
                key={row.rank}
                rankDirection={row.rankDirection}
                rank={row.rank.toString()}
                id={row.instagramHandle}
                voteEnabled={currentTime < endDatetime}
              />
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
};
