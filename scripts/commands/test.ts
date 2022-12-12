import { Message, MessageDirection, MessageMap } from "../messaging/MessagingProvider";
import CommandCoordinator from "./CommandCoordinator";
import SendVotesCommand from "./SendVotesCommand";
import VoteCommand from "./VoteCommand";

function generateTestMessage(senderId: string, text: string, direction: MessageDirection): Message {
  return {
    id: "1",
    text: text,
    source_type: "text",
    status: "good",
    created_at: new Date(),
    media: "",
    inbound: direction === "inbound" ? true : false,
  };
}

const TEST_MESSAGES: MessageMap = {
  "1": [generateTestMessage("1", "send:votes", "inbound")],
  "2": [generateTestMessage("2", "vote: 2", "inbound")],
  "3": [generateTestMessage("3", "vote: 1", "inbound")],
  "58704615-37e5-4148-804c-e675f5107968": [
    generateTestMessage("58704615-37e5-4148-804c-e675f5107968", "vote: 1", "inbound"),
    generateTestMessage("58704615-37e5-4148-804c-e675f5107968", "send:votes", "inbound"),
  ],
};

async function main() {
  const cc = new CommandCoordinator([new VoteCommand(["vote: "]), new SendVotesCommand(["send:votes"])]);
  const response = await cc.apply(TEST_MESSAGES);
  console.log(response);
}

main();
