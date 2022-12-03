import { Twilio } from "twilio";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({
  path: ".env.local",
});

async function purchaseNumber(client: Twilio, areaCode: number): Promise<any> {
  // Purchase a new phone number
  const numbers = await client.availablePhoneNumbers("US").local.list({ areaCode });
  const number = numbers[0];

  const purchasedNumber = await client.incomingPhoneNumbers.create({
    phoneNumber: number.phoneNumber,
  });

  //   const purchasedNumber = await number.purchase();
  return purchasedNumber;
}

async function listIncomingNumbers(client: Twilio) {
  return await client.incomingPhoneNumbers.list();
}

async function sendMessageFromNumber(client: Twilio, to: string, from: string, body: string) {
  const message = await client.messages.create({
    to,
    from,
    body,
  });
  return message;
}

async function readInboundMessages(client: Twilio) {
  const messages = await client.messages.list({ limit: 20 });
  // filter out messages that are outbound
  const inboundMessages = messages.filter((message) => message.direction === "inbound");
  console.log("Inbound messages: ", inboundMessages);
}

async function sendVoteMessageToCommunityNumber(client: Twilio, community: any, vote: any) {
  const message = await client.messages.create({
    to: community.phoneNumber,
    from: community.twilioNumber,
    body: `Vote for ${vote.instagramHandle}!`,
  });
  return message;
}

async function main() {
  // Your Twilio account SID and auth token, which you can get from your Twilio account dashboard
  var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
  var authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.log("Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env.local file");
    return;
  }

  // Create a client object
  const client = new Twilio(accountSid, authToken);

  // // The area code you want to purchase a phone number in
  const areaCode = 703;
  // const toPhoneNumber = "+15712633393";
  // const toPhoneNumber = "+17034630803";
  const toPhoneNumber = "+19178103314";
  const messageBody = "VOTE: felly";

  // if no twilio number is set, purchase one
  //   const purchasedNumber = await purchaseNumber(client, areaCode);

  const numbers = await listIncomingNumbers(client);
  if (numbers.length === 0) {
    const purchasedNumber = await purchaseNumber(client, areaCode);
    console.log("Purchased number: ", purchasedNumber.phoneNumber);
    const message = await sendMessageFromNumber(client, toPhoneNumber, purchasedNumber.phoneNumber, messageBody);
    console.log("Message sent: ", message.sid);
  } else {
    const message = await sendMessageFromNumber(client, toPhoneNumber, numbers[0].phoneNumber, messageBody);
    console.log("Message sent: ", message.sid);
  }
}

async function main2() {
  // Your Twilio account SID and auth token, which you can get from your Twilio account dashboard
  var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
  var authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.log("Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env.local file");
    return;
  }

  // Create a client object
  const client = new Twilio(accountSid, authToken);

  await readInboundMessages(client);
}

main();
// main2();
