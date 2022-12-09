import { useRouter } from "next/router";
import { useEffect } from "react";
import Subheader from "./design-system/Subheader";
import BillboardButton from "./design-system/BillboardButton";
import { Leaderboard } from "./Leaderboard";
import { getLinkPreview } from "../linkPreviewConfig";
import { RecurringCountdownTimer } from "../components/SimpleCountdown";
import { MainCountdownTimer } from "../components/CountdownTimers";
import { mixpanelClient, VISITED_LEADERBOARD } from "../client/mixpanel";
import { LEADERBOARD_REFRESH_INTERVAL } from "../client/constants";
import { Leaderboard as LeaderboardType } from "@prisma/client";

type LeaderboardPageProps = {
  initialRows: {
    rank: number;
    instagramHandle: string;
    rankDirection: string;
  }[];
  leaderboard: LeaderboardType;
};

const LeaderboardPage = ({ initialRows, leaderboard }: LeaderboardPageProps) => {
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
            <div className="text-xl uppercase">Leaderboard</div>
            <div className="flex-grow"></div> {/* Spacer */}
            <div className="text-sm uppercase">
              Updates in:{" "}
              <RecurringCountdownTimer format="minutesOnly" intervalSeconds={LEADERBOARD_REFRESH_INTERVAL} />
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
        <MainCountdownTimer endDatetime={leaderboard.endTime} />
        <Leaderboard initialRows={initialRows} endDatetime={leaderboard.endTime} />
      </div>
    </div>
  );
};

export default LeaderboardPage;
