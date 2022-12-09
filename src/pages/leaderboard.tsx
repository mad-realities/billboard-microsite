import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { loadRank } from "./api/rank";
import { useEffect } from "react";
import Subheader from "../components/design-system/Subheader";
import BillboardButton from "../components/design-system/BillboardButton";
import { Leaderboard } from "../components/Leaderboard";
import { getLinkPreview } from "../linkPreviewConfig";
import { RecurringCountdownTimer, MainCountdownTimer } from "../components/CountdownTimers";
import { mixpanelClient, VISITED_LEADERBOARD } from "../client/mixpanel";
import { FREEZE_DATE, LEADERBOARD_REFRESH_INTERVAL, LEADERBOARD_PAGE_SIZE } from "../client/constants";

const LeaderboardPage = ({ initialRows }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  useEffect(() => {
    mixpanelClient.track(VISITED_LEADERBOARD);
  }, []);

  const linkPreview = getLinkPreview("LEADERBOARD");

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {linkPreview}
      <div className="flex w-full flex-col items-center gap-2">
        <Subheader>
          <div className="flex flex-row items-end">
            <div className="text-xl">LEADERBOARD</div>
            <div className="flex-grow"></div> {/* Spacer */}
            <div className="text-sm">
              UPDATES IN: <RecurringCountdownTimer intervalSeconds={LEADERBOARD_REFRESH_INTERVAL} />
            </div>
          </div>
        </Subheader>

        <div className="flex w-full flex-row gap-2">
          <BillboardButton className="uppercase" fill color="mr-yellow" onPress={() => router.push("/vote")}>
            Nominate
          </BillboardButton>
          <BillboardButton className="uppercase" fill color="transparent" onPress={() => router.push("/check")}>
            Check rank
          </BillboardButton>
        </div>
        <MainCountdownTimer endDatetime={FREEZE_DATE} />
        <Leaderboard initialRows={initialRows} />
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const results = await loadRank(0, LEADERBOARD_PAGE_SIZE);

  return {
    props: {
      initialRows: results,
    },
  };
};

export default LeaderboardPage;
