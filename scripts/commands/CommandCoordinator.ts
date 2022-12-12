import { MessageMap } from "../messaging/MessagingProvider";
import Command, { CommandReturnType } from "./Command";

export default class ComandCoordinator {
  async apply(messages: MessageMap): Promise<{ [command: string]: CommandReturnType }> {
    const commandReturnTypes: { [command: string]: CommandReturnType } = {};
    for (const command of this.commands) {
      const commandReturnType = await command.apply(messages);
      commandReturnTypes[command.toString()] = commandReturnType;
    }
    return commandReturnTypes;
  }

  async combineCommandReturnTypes(commandReturnTypes: {
    [command: string]: CommandReturnType;
  }): Promise<CommandReturnType> {
    const combinedCommandReturnType: CommandReturnType = {
      dbRecords: { votes: [] },
      messagePayload: [],
    };
    for (const commandReturnType of Object.values(commandReturnTypes)) {
      combinedCommandReturnType.dbRecords.votes = combinedCommandReturnType.dbRecords.votes.concat(
        commandReturnType.dbRecords.votes,
      );
      combinedCommandReturnType.messagePayload = combinedCommandReturnType.messagePayload.concat(
        commandReturnType.messagePayload,
      );
    }
    return combinedCommandReturnType;
  }

  async applyAndCombine(messages: MessageMap): Promise<CommandReturnType> {
    const commandReturnTypes = await this.apply(messages);
    return await this.combineCommandReturnTypes(commandReturnTypes);
  }

  checkForOverlappingKeywords(): void {
    const keywords: string[] = [];
    for (const command of this.commands) {
      for (const keyword of command.keywords) {
        if (keywords.includes(keyword)) {
          throw new Error(`Keyword ${keyword} is used by more than one command`);
        }
        keywords.push(keyword);
      }
    }
  }

  commands: Command[];

  constructor(commands: Command[]) {
    this.commands = commands;
    this.checkForOverlappingKeywords();
  }
}
