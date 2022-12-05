import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({
  path: ".env.local",
});

export async function getLinkPreviewUrl(handle: string) {
  try {
    if (!process.env.HTML_TO_CSS_API_KEY || !process.env.HTML_TO_CSS_USER_ID) {
      console.log(process.env.HTML_TO_CSS_API_KEY);
      console.log(process.env.HTML_TO_CSS_USER_ID);
      return "/mad_famous_link_preview.png";
    } else {
      const url = "https://hcti.io/v1/image";
      const previewUrl = "https://billboard-microsite-git-feat-generate-images-mad-realities.vercel.app";
      const payload = { url: `${previewUrl}/profile/${handle}/preview` };

      const headers = {
        auth: {
          username: process.env.HTML_TO_CSS_USER_ID,
          password: process.env.HTML_TO_CSS_API_KEY,
        },
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(url, payload, { ...headers, timeout: 10000 });
      const data = response.data;
      return data["url"];
    }
  } catch (e) {
    console.log(e);
    return "/mad_famous_link_preview.png";
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Method Not Allowed");
  } else {
    try {
      const { handle } = req.query;
      if (!handle) {
        res.status(400).end("Bad Request, missing handle");
      } else if (!process.env.HTML_TO_CSS_API_KEY || !process.env.HTML_TO_CSS_USER_ID) {
        res.status(500).end("Server Error");
      } else {
        const url = await getLinkPreviewUrl(handle as string);
        res.json({ url: url });
      }
    } catch (e) {
      console.log(e);
      res.status(500).end("Server Error");
    }
  }
};

export default handler;
