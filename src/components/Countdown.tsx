import React, { useEffect, useState } from "react";

interface Props {
  endDatetime: Date;
  onEnd: () => void;
  onEndWindowSeconds?: number;
}

const defaultProps = {
  onEndWindowSeconds: 2,
};

function getCountdownString(current: Date, end: Date) {
  const distance = end.getTime() - current.getTime();

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const dayString = days > 0 ? days + "d " : "";
  const hourString = hours > 0 ? hours + "h " : "";
  const minString = minutes > 0 ? minutes + "m " : "";
  const secString = seconds + "s";

  return dayString + hourString + minString + secString;
}

function getSimpleCountdownString(current: Date, end: Date) {
  const distance = end.getTime() - current.getTime();

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // string should be in the format of 00:00:00:00
  const dayString = days > 0 ? days.toString().padStart(2, "0") + ":" : "00:";
  const hourString = hours > 0 ? hours.toString().padStart(2, "0") + ":" : "00:";
  const minString = minutes > 0 ? minutes.toString().padStart(2, "0") + ":" : "00:";
  const secString = seconds.toString().padStart(2, "0");

  //   const dayString = days > 0 ? days + "d " : "";
  //   const hourString = hours > 0 ? hours + "h " : "";
  //   const minString = minutes > 0 ? minutes + "m " : "";
  //   const secString = seconds + "s";

  return dayString + hourString + minString + secString;
}

function CountdownTimer({ endDatetime, onEnd, onEndWindowSeconds }: Props & typeof defaultProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [triggered, setTriggered] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      // we store date in variable to make sure it's consistent
      const newDate = new Date();
      const timeDiff = (endDatetime.getTime() - newDate.getTime()) / 1000;
      const inRange = timeDiff < onEndWindowSeconds;
      if (inRange && !triggered) {
        onEnd();
        setTriggered(true);
      }
      setCurrentTime(newDate);
    }, 300);

    return () => clearInterval(timer);
  }, [onEnd, endDatetime, currentTime, triggered, onEndWindowSeconds]);

  useEffect(() => {
    setTriggered(false);
  }, [endDatetime]);

  return <div suppressHydrationWarning>{getSimpleCountdownString(currentTime, endDatetime)}</div>;
}

CountdownTimer.defaultProps = defaultProps;

export default CountdownTimer;
