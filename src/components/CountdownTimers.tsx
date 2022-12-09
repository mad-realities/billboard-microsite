import { useState, useEffect } from "react";
import SimpleCountdownTimer from "./SimpleCountdown";
import { CONTACT_PHONE_NUMBER } from "../client/constants";
import { BillboardButton } from "./design-system";

interface RecurringCountdownTimerProps {
  intervalSeconds: number;
}

interface MainCountdownTimerProps {
  endDatetime: Date;
}

export function RecurringCountdownTimer({ intervalSeconds }: RecurringCountdownTimerProps) {
  const INTERVAL = intervalSeconds * 1000;
  const [targetTime, setTargetTime] = useState<Date>(new Date(Math.ceil(Date.now() / INTERVAL) * INTERVAL));

  const onDone = () => {
    // +1 to Date.now() to force us to the next interval in case we happen to call this function
    // on the exact millisecond when the previous interval finishes.
    setTargetTime(new Date(Math.ceil((Date.now() + 1) / INTERVAL) * INTERVAL));
  };

  return <SimpleCountdownTimer endDatetime={targetTime} onDoneWindowSeconds={2} onDone={onDone} format="minutesOnly" />;
}

export function MainCountdownTimer({ endDatetime }: MainCountdownTimerProps) {
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
    <div className="text-center">
      {/* We need to suppress hydration warning because we're using a different date on the server */}
      <div className="text-5xl font-bold">
        <SimpleCountdownTimer endDatetime={endDatetime} onDoneWindowSeconds={2} onDone={() => setDone(true)} />
      </div>
      <div className="uppercase">until voting closes for the billboard</div>
    </div>
  );
}
