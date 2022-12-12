import { NextApiRequest, NextApiResponse } from "next";
import { SendVotesCommand, VoteCommand } from "../../../scripts/commands";
import CommandCoordinator from "../../../scripts/commands/CommandCoordinator";
import ScriptCoordinator from "../../../scripts/ScriptCoordinator";
import { prisma } from "../../server/prisma";

const cc = new CommandCoordinator([new VoteCommand(["vote: ", "v: "]), new SendVotesCommand(["send:vote"])]);
const scriptCoordinator = new ScriptCoordinator(cc, { debug: true });

// TODO: Convert to POST request to ensure API key doesn't get passed in plaintext.
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
          const scriptResponse = await scriptCoordinator.runCommandsSinceLastRun();
          res.status(200).json(scriptResponse);
        }
      }
    } catch (e) {
      res.status(500).end("Server Error" + e);
    }
  }
};

export default handler;
