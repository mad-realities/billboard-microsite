import fetch from "node-fetch";

const getUserData = async (username) => {
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
          throw new Error("Unknown error");
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

console.log(await getUserData("therealslimshreydy"));
