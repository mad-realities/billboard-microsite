import { Twilio } from "twilio";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { codes, instagramHandles } from "./codes";
import { delay } from "./script";
import { activateCommunityFanSubscription, getFanSubscriptionIdFromSignupLink } from "./community";

dotenv.config({
  path: ".env.local",
});

const COMMUNITY_PHONE_NUMBER = "+19178103314";
// const COMMUNITY_PHONE_NUMBER = "+12058945232";
const D_NUMBER = "+15712633393";
const X_NUMBER = "+17034630803";

async function purchaseNumber(client: Twilio, areaCode?: number): Promise<any> {
  let counter = 0;
  // get random area code
  // if counter gets to 10 stop trying
  while (counter < 10) {
    counter = counter + 1;

    try {
      // get random area code
      areaCode = areaCode
        ? areaCode
        : Number(Object.keys(codes)[Math.floor(Math.random() * Object.keys(codes).length)]);

      const response = await client.availablePhoneNumbers("US").local.list({
        areaCode,
        limit: 1,
      });
      const number = response[0];
      const purchasedNumber = await client.incomingPhoneNumbers.create({
        phoneNumber: number.phoneNumber,
      });
      return purchasedNumber;
    } catch (error) {
      console.log("Error purchasing number with area code: ", areaCode);
    }
  }
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
  const messages = await client.messages.list({ limit: 100 });
  // filter out messages that are outbound
  const inboundMessages = messages.filter((message) => message.direction === "inbound");
  return inboundMessages;
}

async function sendVoteMessageToCommunityNumber(client: Twilio, community: any, vote: any) {
  const message = await client.messages.create({
    to: community.phoneNumber,
    from: community.twilioNumber,
    body: `Vote for ${vote.instagramHandle}!`,
  });
  return message;
}

async function getMessagesBetweenNumbers(client: Twilio, num1: string, num2: string) {
  // get all messages to and from num1 and num2
  const oneWay = await client.messages.list({ to: num1, from: num2 });
  const otherWay = await client.messages.list({ to: num2, from: num1 });
  return [...oneWay, ...otherWay];
}

async function getIncomingMessages(client: Twilio, to: string, from: string) {
  const oneWay = await client.messages.list({ to, from });
  return oneWay;
}

function printMessage(message: MessageInstance) {
  console.log(
    "Message: ",
    message.sid,
    " to ",
    message.to,
    " from ",
    message.from,
    " body: ",
    message.body,
    " status: ",
    message.status,
    " direction: ",
    message.direction,
    " dateSent: ",
    message.dateSent,
  );
}

function findLinkInMessages(messages: MessageInstance[]) {
  // find link in messages
  const links = messages.map((message) => {
    const link = message.body.match(/https:\/\/[^\s]+/g);
    return link;
  });

  // return first non null link
  const link = links.flat().find((link) => link);
  console.log("link: ", link);
  return link;
}

async function signUpForCommunity(client: Twilio, phoneNumber: string, signUpMessage: string = "Sign me up!") {
  const message = await sendMessageFromNumber(client, COMMUNITY_PHONE_NUMBER, phoneNumber, signUpMessage);
  console.log("Sent sign up message:", message.body, " to ", message.to);

  let gotResponse = false;

  await delay(3000);

  const messages = await getIncomingMessages(client, phoneNumber, COMMUNITY_PHONE_NUMBER);
  if (messages.length > 0) {
    gotResponse = true;
    console.log("Got response from community!!!!\n");
    const signupLink = findLinkInMessages(messages);
    if (signupLink) {
      const fanId = await getFanSubscriptionIdFromSignupLink(signupLink as string);
      if (fanId) {
        const signup = activateCommunityFanSubscription(fanId);
        console.log("signup: ", signup);
        return true;
      }
    }
    return false;
  }

  return false;
}

function getClient() {
  // Your Twilio account SID and auth token, which you can get from your Twilio account dashboard
  var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
  var authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.log("Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env.local file");
    return;
  }

  // Create a client object
  const client = new Twilio(accountSid, authToken);
  return client;
}

function getRandomInstagramHandle() {
  return instagramHandles[Math.floor(Math.random() * instagramHandles.length)];
}

const SIGNUP_MESSAGES = ["MAD", "Sign me up", "hello", "hi", "FAMOUS", "RICH"];
const RANDOM_SIGNUP_MESSAGE = SIGNUP_MESSAGES[Math.floor(Math.random() * SIGNUP_MESSAGES.length)];

// declare options for the script
const OPTIONS = {
  purchase: true,
  numPhoneNumbers: 1,
  vote: "Vote: vote",
  signUpMessage: "gm",
};

main(OPTIONS);

async function main(options: typeof OPTIONS) {
  const client = getClient();
  if (!client) return;

  const numberObjs = await getListOfNumbers(client, options.numPhoneNumbers, options);
  const numbers = numberObjs.map((numberObj) => numberObj.phoneNumber);
  let counter = 0;

  const promises = numbers.map(async (number) => {
    const success = await handleEngagement(client, number, options);

    if (success) {
      counter = counter + 1;
    }
  });
  await Promise.all(promises);

  console.log(counter, "Engagement(s) handled out of ", numbers.length);
}

async function checkMessagesForWord(messages: MessageInstance[], word: string) {
  const found = messages.some((message) => message.body.includes(word));
  return found;
}

async function handleEngagement(client: Twilio, number: string, option: typeof OPTIONS) {
  // check if number has a message recieved from the community number
  const messages = await getIncomingMessages(client, number, COMMUNITY_PHONE_NUMBER);
  const messagesSayRose = await checkMessagesForWord(messages, "ROSE");

  let signedUp = false;
  if (messages.length !== 0 && messagesSayRose) {
    // already signed up
    signedUp = true;
  } else {
    // complete sign up process
    console.log("Signing up for community: ", number);
    signedUp = await signUpForCommunity(client, number, option.signUpMessage);
  }

  if (signedUp) {
    const randomInstagramHandle = getRandomInstagramHandle();
    const message = await sendMessageFromNumber(client, COMMUNITY_PHONE_NUMBER, number, randomInstagramHandle);
    console.log("Congrats you voted! ", message.body, " from ", message.from, " to ", message.to);
    return true;
  } else {
    console.log("Failed to signup for community :( ", number);
  }
}

async function getListOfNumbers(client: Twilio, amount: number, options: typeof OPTIONS) {
  const numberObjs = await listIncomingNumbers(client);
  if (options.numPhoneNumbers <= numberObjs.length) {
    console.log("You have more phone numbers than you need");
  } else {
    const numToPurchase = options.numPhoneNumbers - numberObjs.length;
    console.log("You need to purchase ", numToPurchase, " more phone numbers");
    if (options.purchase) {
      for (let i = 0; i < numToPurchase; i++) {
        const purchasedNumber = await purchaseNumber(client, 917);
        console.log("Purchased number: ", purchasedNumber.phoneNumber);
      }
    } else {
      console.log("Not purchasing any numbers");
    }
  }

  const numberObjs2 = await listIncomingNumbers(client);
  if (numberObjs2.length < amount) {
    console.log(":( You asked for ", amount, " numbers. You recieved ", numberObjs2.length);
  } else {
    console.log(":)");
  }

  return numberObjs2.slice(0, amount);
}
