import React, { useEffect, useState } from "react";

function UpdateCounter() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      // we store date in variable to make sure it's consistent
      const newDate = new Date();
      setCurrentTime(newDate);
    }, 3000);

    return () => clearInterval(timer);
  }, [currentTime]);

  // number of minutes until the minute time ends in 0 or 5
  const minutesUntilUpdate = 5 - (new Date().getMinutes() % 5);
  const updatesInString = minutesUntilUpdate === 1 ? "MIN" : "MINS";

  return <div suppressHydrationWarning>{` ${minutesUntilUpdate} ${updatesInString} `}</div>;
}

export default UpdateCounter;
