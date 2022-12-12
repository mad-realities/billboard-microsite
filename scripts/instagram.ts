import fetch from "node-fetch";
import { incrementCount } from "./monitoring/datadog";
import { Vote } from "./db/vote";

export const instagramVote = async (vote: Vote) => {
  try {
    vote.vote = vote.vote.replace("@", "");
    const handleValid = await validInstagramHandle(vote.vote);
    if (handleValid) {
      const isValid = await isValidUsername(vote.vote);
      incrementCount("instgram.account.valid", 1, [`handle:${vote.vote}`, `valid:${isValid}`, "success"]);

      if (isValid) {
        return vote;
      }
    }
  } catch (e) {
    console.error("Error checking if username", vote.vote, "exists.", "Error:", e);
    console.log("Since instagram check isn't working, we'll just assume it's valid");
    incrementCount("instgram.account.valid", 1, [`handle:${vote.vote}`, "failure"]);

    // since instagram check failed, we'll assume the handle is valid
    return vote;
  }

  return null;
};

export const isValidUsername = async (username: string) => {
  try {
    const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
        "X-IG-App-ID": "936619743392459",
        Accept: "*/*",
      },
    });

    if (response.status === 404) {
      return false;
    } else if (response.status === 200) {
      return true;
    } else {
      console.log(response);
      throw new Error("Unknown error: " + response.status.toString());
    }
  } catch (err) {
    throw new Error("Unknown error: " + err);
  }
};

const getUserData = async (username: string) => {
  return await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
      "X-IG-App-ID": "936619743392459",
      Accept: "*/*",
    },
  })
    .then((res) => {
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("User not found");
        } else {
          throw new Error("Unknown error: " + res.status.toString());
        }
      }
      return res.json();
    })
    .then((json) => ({
      bio: json.data.user.biography,
      username: json.data.user.username,
      profilePic: json.data.user.profile_pic_url,
      isPrivate: json.data.user.is_private,
    }))
    .catch((err) => console.error(err));
};

/**
 * Your handle can't exceed 30 characters
 * It can only contain letters, numbers, and periods
 * It can't contain symbols or punctuation marks
 * It needs to be unique
 */
export async function validInstagramHandle(handle: string) {
  return handle.length <= 30 && /^[a-zA-Z0-9._]+$/.test(handle);
}

async function main() {
  const isValid = await isValidUsername("ftx");
  console.log("isValid", isValid);
}
