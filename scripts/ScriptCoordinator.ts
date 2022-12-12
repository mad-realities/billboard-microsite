import { VoteCommand, SendVotesCommand } from "./commands";
import { CommandReturnType } from "./commands/Command";
import CommandCoordinator from "./commands/CommandCoordinator";
import { DEFAULT_LEADERBOARD_ID } from "./constants";
import { createEmptyScriptRun, getLatestLeaderboard, getLatestScriptRun, getLeaderboard, saveVotesToDB } from "./db/db";
import { CommunityMessagingProvider } from "./messaging/community";
import { MessagingProvider } from "./messaging/MessagingProvider";
import { delay } from "./utils";

interface RunScriptOptions {
  debug?: boolean;
  withDelay?: boolean;
}

export default class ScriptCoordinator {
  cc: CommandCoordinator;
  options: RunScriptOptions;
  _messagingProvider: MessagingProvider;

  constructor(cc: CommandCoordinator, options: RunScriptOptions = { debug: false, withDelay: false }) {
    this.cc = cc;
    this.options = options;
    this._messagingProvider = new CommunityMessagingProvider();
  }

  async randomDelay(): Promise<void> {
    // random number of miliseconds between 5 seconds and 2 minutes
    const randomDelay = Math.floor(Math.random() * 120000) + 5000;
    console.log("Waiting", randomDelay, "ms");
    await delay(randomDelay);
  }

  async applyCommands(commandReturn: CommandReturnType, leaderboardId: number) {
    const {
      messagePayload: messages,
      dbRecords: { votes },
    } = commandReturn;
    const scriptRun = await saveVotesToDB(votes, leaderboardId);
    console.log("Successfully saved votes to DB", scriptRun);
    console.log("Sending", messages);
    const count = await this._messagingProvider.sendMessages(messages);
    console.log("Sent", count, "messages");
    return commandReturn;
  }

  async debugPrintCommands(commandReturn: CommandReturnType) {
    const {
      messagePayload: messages,
      dbRecords: { votes },
    } = commandReturn;
    console.log("Debug mode, not saving votes to DB");
    console.log("Votes to save", votes);
    console.log("Debug mode, not saving votes to DB");
    console.log("Messages to send", messages);
    console.log("Debug mode, not sending messages");
    return commandReturn;
  }

  async runCommandsSinceLastRun(): Promise<CommandReturnType> {
    if (this.options.withDelay) await this.randomDelay();

    const latestScriptRun = await getLatestScriptRun();

    if (latestScriptRun) {
      const dateSinceLastRun = new Date(latestScriptRun.timestamp);
      console.log("Last script ran at", dateSinceLastRun.toLocaleString());

      const messagesSinceLastRun = await this._messagingProvider.getMessagesSinceDate(dateSinceLastRun);
      const commandReturn = await this.cc.applyAndCombine(messagesSinceLastRun);
      const leaderboard = await getLatestLeaderboard();
      if (!leaderboard) throw new Error("No leaderboard found");

      // create new script run
      if (!this.options.debug) {
        return await this.applyCommands(commandReturn, leaderboard.id);
      } else {
        return this.debugPrintCommands(commandReturn);
      }
    } else {
      const new_script_run = await createEmptyScriptRun(DEFAULT_LEADERBOARD_ID);
      throw new Error("Run Again - No script runs found, created new script run: " + new_script_run);
    }
  }

  /**
   * Runs commands over period the corresponding leaderboard is active
   *
   * @param leaderboardId id of leaderboard to run commands for
   * @returns CommandReturnType
   */
  async runCommandsForLeaderboard(leaderboardId: number): Promise<CommandReturnType> {
    if (this.options.withDelay) await this.randomDelay();

    const leaderboard = await getLeaderboard(leaderboardId);

    if (leaderboard) {
      const startTime = new Date(leaderboard.startTime);
      const endTime = new Date(leaderboard.endTime);

      console.log("Leaderboard active from", startTime.toLocaleString(), "to", endTime.toLocaleString());

      const messagesForLeaderboard = await this._messagingProvider.getMessagesBetweeenDates(startTime, endTime);
      const commandReturn = await this.cc.applyAndCombine(messagesForLeaderboard);

      // create new script run
      if (!this.options.debug) {
        return await this.applyCommands(commandReturn, leaderboardId);
      } else {
        return this.debugPrintCommands(commandReturn);
      }
    } else {
      throw new Error("No leaderboard found with id: " + leaderboardId);
    }
  }

  /*
   * This method is used to apply commands in a sweeping pattern as described below:
   * If there's an active leaderboard sweep since leaderboard start until current time
   * else sweep since the latest active period
   *
   * ASSUMES ONLY ONE LEADERBOARD IS ACTIVE AT A TIME
   **/
  async runCommandsInSweepingPattern(): Promise<CommandReturnType> {
    if (this.options.withDelay) await this.randomDelay();

    const leaderboard = await getLatestLeaderboard();

    if (leaderboard) {
      const startTime = new Date(leaderboard.startTime);
      const endTime = new Date(leaderboard.endTime);

      const isLeaderboardActive = new Date() < endTime && new Date() > startTime;
      if (isLeaderboardActive) {
        console.log("Leaderboard active from", startTime.toLocaleString(), "to", endTime.toLocaleString());
        return await this.runCommandsForLeaderboard(leaderboard.id);
      } else {
        const now = new Date();

        console.log(
          "Leaderboard isn't active anymore. It ran from",
          startTime.toLocaleString(),
          "to",
          endTime.toLocaleString(),
        );
        console.log("Sweeping from", endTime.toLocaleString(), "to", now.toLocaleString());

        const messagesInSweep = await this._messagingProvider.getMessagesBetweeenDates(endTime, now);
        console.log("Messages in sweep", messagesInSweep.length);
        const commandReturn = await this.cc.applyAndCombine(messagesInSweep);

        // create new script run
        if (!this.options.debug) {
          return await this.applyCommands(commandReturn, leaderboard.id);
        } else {
          return this.debugPrintCommands(commandReturn);
        }
      }
    } else {
      throw new Error("No leaderboard found");
    }
  }
}

// async function main() {
//   const cc = new CommandCoordinator([new VoteCommand(["vote: "]), new SendVotesCommand(["send:votes", "send votes"])]);
//   const sc = new ScriptCoordinator(cc, { debug: true, withDelay: false });

//   // const response = await sc.runCommandsSinceLastRun();
//   // const response = await sc.runCommandsForLeaderboard(1);
//   // const response = await sc.runCommandsInSweepingPattern();
//   // console.log(response);
// }

// main();
