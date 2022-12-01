import { CONTACT_PHONE_NUMBER } from "./constants";

export function ordinal_suffix_of(i: number) {
  const j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

export function cutOffStringIfTooLong(string: string, length: number) {
  if (string.length > length) {
    return string.substring(0, length) + "...";
  }
  return string;
}

export function getSmsHref(handle: string) {
  return `sms:${CONTACT_PHONE_NUMBER}?body=VOTE:${handle}`;
}