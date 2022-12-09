import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { loadRank } from "./api/rank";
import { useEffect, useState } from "react";
import Subheader from "../components/design-system/Subheader";
import BillboardButton from "../components/design-system/BillboardButton";
import { Leaderboard } from "../components/Leaderboard";
import SimpleCountdownTimer from "../components/Countdown";
import { getLinkPreview } from "../linkPreviewConfig";
import UpdateCounter from "../components/UpdateCounter";
import { mixpanelClient, VISITED_LEADERBOARD } from "../client/mixpanel";
import { CONTACT_PHONE_NUMBER } from "../client/constants";
import { FREEZE_DATE } from "../client/constants";

interface CountdownTimerProps {
  endDatetime: Date;
}

const pageSize = 20;

function CountdownTimer({ endDatetime }: CountdownTimerProps) {
  const [done, setDone] = useState<boolean>(new Date() >= endDatetime);

  useEffect(() => {
    setDone(new Date() >= endDatetime);
  }, [endDatetime]);

  return done ? (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="text-5xl font-bold uppercase">Voting is closed</div>
      <div>Want to bring back round 2 of the Billboard?</div>
      <a href={`sms:${CONTACT_PHONE_NUMBER}?&body=BRINGITBACK`}>
        <BillboardButton color="mr-sky-blue" className="uppercase">
          Text to bring it back
        </BillboardButton>
      </a>
    </div>
  ) : (
    <div>
      {/* We need to suppress hydration warning because we're using a different date on the server */}
      <div className="text-5xl font-bold">
        <SimpleCountdownTimer endDatetime={endDatetime} onDoneWindowSeconds={2} onDone={() => setDone(true)} />
      </div>
      <div className="text-center uppercase">until voting closes for the billboard</div>
    </div>
  );
}

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
          <div className="flex w-full flex-row">
            <div className="text-sm">LEADERBOARD</div>
            <div className="flex-grow"></div>
            <div className="place-items-end">
              <div className="flex flex-row gap-1 text-sm">
                <div>
                  <div>UPDATES IN: </div>
                  <div>
                    <UpdateCounter />
                  </div>
                </div>
              </div>
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

        <CountdownTimer endDatetime={FREEZE_DATE} />

        <Leaderboard initialRows={initialRows} />
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const results = await loadRank(0, pageSize);

  return {
    props: {
      initialRows: results,
    },
  };
};

export default LeaderboardPage;
