import { useRouter } from "next/router";
import Image from "next/image";
import { useWindowSize } from "../client/hooks";
import BillboardButton from "../components/design-system/BillboardButton";
import Subheader from "../components/design-system/Subheader";
import Head from "next/head";
import { getLinkPreview } from "../linkPreviewConfig";

const IndexPage = () => {
  const router = useRouter();
  const linkPreview = getLinkPreview("LANDING");

  const HOWITWORKS = (
    <div className="flex flex-col items-center gap-2 rounded border border-white p-2">
      <div className="text-4xl text-mr-yellow">HOW IT WORKS</div>

      <div className="mt-3 text-center text-2xl text-mr-lime"> NOMINATE </div>
      <div className="text-center text-xl">
        On Mondays at 7 PM ET, a leaderboard opens. Nominate friends (or yourself) for a chance at 15 seconds of fame.{" "}
      </div>

      <div className="mt-3 text-center text-2xl text-mr-lime"> RACK UP VOTES </div>
      <div className="text-center text-xl">
        Whoever has the most votes before Wednesdays at 11:59 PM ET will end up on the next billboard.
      </div>

      <div className="mt-3 text-center text-2xl text-mr-lime"> GET MAD FAMOUS </div>
      <div className="text-center text-xl">
        Go to <a>this billboard </a> in Times Square on Sunday from 6-8pm to see the winner on the big screen.
      </div>

      <div className="mt-3 text-center text-2xl text-mr-lime"> REPEAT </div>
      <div className="text-center text-xl">This drop will run for 2 weeks starting Monday, December 5th.</div>

      <div className="mt-3 text-center text-2xl text-mr-lime"> QUESTIONS? </div>
      <div className="text-center text-xl">Text “HELP” to (917) 810-3314.</div>
    </div>
  );

  const MADCTA = (
    <div className="flex flex-col items-center gap-2 rounded border border-white p-2 pt-8">
      <div className="text-4xl text-mr-yellow">Reality is MAD</div>
      <div className="text-4xl text-mr-yellow">Join ours instead.</div>

      <div className="text-center text-xl">Mad Realities creates stages, you influence the outcome.</div>

      <div className="text-center text-xl">
        Sign up for text updates on future drops, IRL events, and other cool secrets.
      </div>

      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-hot-pink" onPress={() => router.push("/vote")}>
          <span className="text-2xl font-regular uppercase tracking-wide">Nominate</span>
        </BillboardButton>
        <BillboardButton fill color="mr-pink" onPress={() => router.push("/leaderboard")}>
          <span className="text-2xl font-regular uppercase tracking-wide">Leaderboard</span>
        </BillboardButton>
      </div>
    </div>
  );

  return (
    <div className="align-center item-around flex h-full w-full grow flex-col items-center gap-2 p-3 text-white">
      {linkPreview}
      <Subheader>
        <span className="text-[18px] uppercase">You&apos;re here. You&apos;re there. You&apos;re everywhere.</span>
      </Subheader>
      <div className="relative h-[340px] w-full">
        <Image src="/cabs.png" alt="Mad Realities wordmark logo" fill />
      </div>
      <Subheader flipped>
        <div className="text-right text-[19px] uppercase">You&apos;re on a billboard in Times Square.</div>
      </Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/vote")}>
          <span className="text-2xl font-regular uppercase tracking-wide">Nominate</span>
        </BillboardButton>
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/leaderboard")}>
          <span className="text-2xl font-regular uppercase tracking-wide">Leaderboard</span>
        </BillboardButton>
      </div>
      <Image src="/polygon.png" alt="Mad Realities wordmark logo" width={30} height={10} />
      {HOWITWORKS}
      {MADCTA}
      {/* <ol className="list-inside list-decimal text-center text-xl">
        <li className="m-4">Nominate your friend</li>
        <li className="m-4">The more nomintations the higher chances</li>
        <li className="m-4">See your friend on the big screen</li>
      </ol> */}
    </div>
  );
};

export default IndexPage;
