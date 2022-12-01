import { useRouter } from "next/router";
import Image from "next/image";
import BillboardButton from "../components/design-system/BillboardButton";
import Subheader from "../components/design-system/Subheader";
import { getLinkPreview } from "../linkPreviewConfig";
import SmallBillboardButton from "../components/design-system/SmallBillboardButton";

const IndexPage = () => {
  const router = useRouter();
  const linkPreview = getLinkPreview("LANDING");

  const HOWITWORKS = (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-white p-10">
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
    <div className="flex flex-col items-center gap-4 rounded-xl border border-white p-3 pt-8">
      <div className="text-4xl text-mr-yellow">Reality is MAD</div>
      <div className="text-4xl text-mr-yellow">Join ours instead.</div>

      <div className="text-center text-xl">Mad Realities creates stages, you influence the outcome.</div>

      <div className="text-center text-xl">
        Sign up for text updates on future drops, IRL events, and other cool secrets.
      </div>

      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-hot-pink">
          <a href="https://madrealities.xyz" target="_blank" rel="noreferrer">
            <span className="text-xl font-regular uppercase tracking-wide">GET UPDATES</span>
          </a>
        </BillboardButton>
        <BillboardButton fill color="transparent" transparentAccent="mr-sky-blue">
          <a href="https://my.community.com/madrealities?t=SUP" target="_blank" rel="noreferrer">
            <span className="text-xl font-regular uppercase tracking-wide">LEARN MORE</span>
          </a>
        </BillboardButton>
      </div>
    </div>
  );

  const FOOTER = (
    <div className="my-2 flex flex-row gap-2">
      <SmallBillboardButton fill color="mr-sky-blue" className="w-auto">
        <a href="https://madrealities.xyz/Terms-of-Service" target="_blank" rel="noreferrer">
          <span className="mx-10 text-sm font-regular uppercase tracking-wide">TERMS</span>
        </a>
      </SmallBillboardButton>
      <SmallBillboardButton fill color="mr-lime">
        <a href="https://my.community.com/madrealities?t=HELP" target="_blank" rel="noreferrer">
          <span className="mx-1 text-sm font-regular uppercase tracking-wide">CONTACT SUPPORT</span>
        </a>
      </SmallBillboardButton>
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
      {FOOTER}

      {/* <ol className="text-xl text-center list-decimal list-inside">
        <li className="m-4">Nominate your friend</li>
        <li className="m-4">The more nomintations the higher chances</li>
        <li className="m-4">See your friend on the big screen</li>
      </ol> */}
    </div>
  );
};

export default IndexPage;
