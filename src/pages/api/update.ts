import { NextApiRequest, NextApiResponse } from "next";
import { runScript } from "../../../scripts/script";
import { prisma } from "../../server/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Method Not Allowed");
  } else {
    try {
      const { apiSecret } = req.query;
      if (apiSecret !== process.env.UPDATE_SECRET) {
        res.status(401).end("Unauthorized");
      } else {
        // get latest script run
        const latestScriptRun = await prisma.scriptRun.findFirst({
          orderBy: {
            timestamp: "desc",
          },
        });

        // check if script was run in the last minute
        const now = new Date();
        const lastMinute = new Date(now.getTime() - 60 * 1000);
        const scriptWasRun = latestScriptRun && latestScriptRun.timestamp > lastMinute;
        if (scriptWasRun) {
          res.status(200).json({
            message:
              "Can't run script within 1 minute of last run which was at: " +
              new Date(latestScriptRun.timestamp).toLocaleTimeString(),
          });
        } else {
          const scriptResponse = await runScript();
          res.status(200).json(scriptResponse);
        }
      }
    } catch (e) {
      res.status(500).end("Server Error" + e);
    }
  }
};

export default handler;
