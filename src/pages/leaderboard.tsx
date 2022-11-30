import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { loadRank } from "./api/rank";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Subheader from "../components/design-system/Subheader";
import BillboardButton from "../components/design-system/BillboardButton";
import { InstagramLeaderboardRow } from "../components/Leaderboard";
import CountdownTimer from "../components/Countdown";

const pageSize = 20;

type Props = {
  props: {
    initialRows: {
      rank: number;
      instagramHandle: string;
    }[];
  };
};
export const getServerSideProps = async (): Promise<Props> => {
  const results = await loadRank(0, pageSize);

  return {
    props: {
      initialRows: results,
    },
  };
};

const LeaderboardPage = ({ initialRows }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [hasMore, setHasMore] = useState(true);

  const getMore = async () => {
    const res = await fetch(`/api/rank?offset=${rows.length}&limit=${pageSize}`);
    const newRowsResponse = await res.json();
    const newRows = newRowsResponse["results"];
    if (newRows.length === 0) {
      setHasMore(false);
    } else {
      setRows((rows) => [...rows, ...newRows]);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2 text-white">
      <div className="flex w-full flex-col items-center gap-2 text-white">
        <Subheader>
          <div className="flex w-full flex-row">
            <div className="text-sm">LEADERBOARD</div>
            <div className="flex-grow"></div>
            <div className="place-items-end">
              <div className="text-sm">
                <CountdownTimer endDatetime={new Date("2022-12-08")} onEnd={console.log} />
              </div>
            </div>
          </div>
        </Subheader>

        <div className="flex w-full flex-row gap-2">
          <BillboardButton fill color="mr-yellow">
            NOMINATE
          </BillboardButton>
          <BillboardButton fill color="mr-yellow" onPress={() => router.push("/leaderboard")}>
            WAIT WHAT?
          </BillboardButton>
        </div>
        <div className="w-full grow rounded-lg border-4 border-double border-mr-pink bg-mr-black">
          <InfiniteScroll
            dataLength={rows.length} //This is important field to render the next data
            next={getMore}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>You have seen it all!</b>
              </p>
            }
          >
            {rows.map((row) => (
              <InstagramLeaderboardRow key={row.rank} rank={row.rank.toString()} id={row.instagramHandle} />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
