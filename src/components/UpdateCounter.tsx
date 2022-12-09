import React, { useEffect, useState } from "react";
import SimpleCountdownTimer from "./Countdown";

function UpdateCounter() {
  const INTERVAL = 5 * 60 * 1000;
  const [targetTime, setTargetTime] = useState<Date>(new Date(Math.ceil(Date.now() / INTERVAL) * INTERVAL));

  const onDone = () => {
    // +1 to Date.now() to force us to the next interval in case we happen to call this function
    // on the exact millisecond when the previous interval finishes.
    setTargetTime(new Date(Math.ceil((Date.now() + 1) / INTERVAL) * INTERVAL));
  };

  return <SimpleCountdownTimer endDatetime={targetTime} onDoneWindowSeconds={2} onDone={onDone} format="minutesOnly" />;
}

export default UpdateCounter;
