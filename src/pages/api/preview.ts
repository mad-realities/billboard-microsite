import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import base64 from "base-64";
dotenv.config({
  path: ".env.local",
});

export async function getLinkPreviewUrl(handle: string, host: string) {
  const hostUrl = `https://${host}`;
  try {
    if (!process.env.HTML_TO_CSS_API_KEY || !process.env.HTML_TO_CSS_USER_ID) {
      console.log("You don't have the HTML_TO_CSS_API_KEY or HTML_TO_CSS_USER_ID");
      return `${hostUrl}/mad_famous_link_preview.png`;
    } else {
      const url = "https://hcti.io/v1/image";
      const payload = { url: `${hostUrl}/profile/${handle}/preview`, viewport_width: 1200, viewport_height: 600 };

      const headers = {
        Authorization: `Basic ${base64.encode(
          `${process.env.HTML_TO_CSS_USER_ID}:${process.env.HTML_TO_CSS_API_KEY}`,
        )}`,
        "Content-Type": "application/json",
      };
      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
      const json = await response.json();

      const deleteResponse = await fetch(json.url, { headers, method: "DELETE" });

      const response2 = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
      const json2 = await response2.json();
      return json2.url;
    }
  } catch (e) {
    console.log(e);
    return `${hostUrl}/mad_famous_link_preview.png`;
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
        const url = await getLinkPreviewUrl(handle as string, req.headers.host as string);
        res.json({ url: url });
      }
    } catch (e) {
      console.log(e);
      res.status(500).end("Server Error");
    }
  }
};

export default handler;
