import React, { useEffect, useState } from "react";
import { match } from "ts-pattern";

interface SimpleCountdownTimerProps {
  endDatetime: Date;
  onDoneWindowSeconds: number;
  onDone: () => void;
  format: "verbose" | "numbersOnly" | "minutesOnly";
}

interface RecurringCountdownTimerProps {
  format: SimpleCountdownTimerProps["format"];
  intervalSeconds: number;
}

const defaultProps = {
  format: "verbose",
};

function verboseCountdownString(timeLeft: number) {
  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.ceil((timeLeft % (1000 * 60)) / 1000);

  const timeComponents = [`${days}d`, `${hours}h`, `${minutes}m`, `${seconds}s`];

  return timeComponents.join(" ");
}

function numbersOnlyCountdownString(timeLeft: number) {
  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const timeComponents = [
    days.toString().padStart(2, "0"),
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ];

  return timeComponents.join(":");
}

function minutesOnlyCountdownString(timeLeft: number) {
  const minutes = Math.ceil(timeLeft / 1000 / 60);
  return minutes == 1 ? "1 min" : `${minutes} mins`;
}

export function SimpleCountdownTimer({
  endDatetime,
  onDoneWindowSeconds,
  onDone,
  format,
}: SimpleCountdownTimerProps & typeof defaultProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [done, setDone] = useState<boolean>(false);

  const stringFormatter = match(format)
    .with("verbose", () => verboseCountdownString)
    .with("numbersOnly", () => numbersOnlyCountdownString)
    .with("minutesOnly", () => minutesOnlyCountdownString)
    .otherwise(() => verboseCountdownString);

  useEffect(() => {
    if (done) {
      return;
    }
    setTimeout(() => {
      const newDate = new Date();
      setCurrentTime(newDate);
      if (newDate > endDatetime && !done) {
        setDone(true);
        onDone();
      }
    }, 1000 - new Date().getMilliseconds());
  }, [onDone, done, endDatetime, currentTime, onDoneWindowSeconds]);

  useEffect(() => {
    setDone(false);
  }, [endDatetime]);

  return <span suppressHydrationWarning>{stringFormatter(endDatetime.getTime() - currentTime.getTime())}</span>;
}

SimpleCountdownTimer.defaultProps = defaultProps;

export function RecurringCountdownTimer({ format, intervalSeconds }: RecurringCountdownTimerProps) {
  const INTERVAL = intervalSeconds * 1000;
  const [targetTime, setTargetTime] = useState<Date>(new Date(Math.ceil(Date.now() / INTERVAL) * INTERVAL));

  const onDone = () => {
    // +1 to Date.now() to force us to the next interval in case we happen to call this function
    // on the exact millisecond when the previous interval finishes.
    setTargetTime(new Date(Math.ceil((Date.now() + 1) / INTERVAL) * INTERVAL));
  };

  return <SimpleCountdownTimer endDatetime={targetTime} onDoneWindowSeconds={2} onDone={onDone} format={format} />;
}
