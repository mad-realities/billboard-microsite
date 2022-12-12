import { Vote } from "../db/vote";
import { MessageMap, MessagePayload } from "../messaging/MessagingProvider";

export type CommandReturnType = {
  dbRecords: { votes: Vote[] };
  messagePayload: MessagePayload[];
};

export default abstract class Command {
  keywords: string[];
  abstract apply(messages: MessageMap): Promise<CommandReturnType>;
  abstract toString(): string;

  constructor(argv: string[]) {
    this.keywords = argv;
  }
}
