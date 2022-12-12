import { CONTACT_PHONE_NUMBER } from "./constants";

export function ordinal_suffix_of(i: number) {
  const j = i % 10;
  const k = i % 100;
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

export function truncateString(string: string, length: number) {
  if (string.length > length) {
    return string.substring(0, length) + "...";
  }
  return string;
}

export function getSmsHref(handle: string) {
  return `sms:${CONTACT_PHONE_NUMBER}?&body=VOTE: ${handle}`;
}

export const formatPhoneNumber = (normalizedPhoneNumber: string) => {
  // This function only supports formatting of US-based phone numbers.
  if (!normalizedPhoneNumber.startsWith("+1")) {
    throw new Error("Unsupported phone number format.");
  }
  const areaCode = normalizedPhoneNumber.slice(2, 5);
  const middleThree = normalizedPhoneNumber.slice(5, 8);
  const lastFour = normalizedPhoneNumber.slice(8);
  return `(${areaCode}) ${middleThree}-${lastFour}`;
};
