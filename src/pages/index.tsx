import { useRouter } from "next/router";
import Image from "next/image";
import BillboardButton from "../components/design-system/BillboardButton";
import Subheader from "../components/design-system/Subheader";
import { getLinkPreview } from "../linkPreviewConfig";
import SmallBillboardButton from "../components/design-system/SmallBillboardButton";
import Link from "next/link";
import { CONTACT_PHONE_NUMBER } from "../client/constants";
import { formatPhoneNumber } from "../client/utils";
import VideoPlayer from "../components/VideoPlayer";

const IndexPage = () => {
  const router = useRouter();
  const linkPreview = getLinkPreview("LANDING");

  const HOWITWORKS = (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-white p-10">
      <div className="text-4xl uppercase text-mr-yellow">How it Works</div>

      <div className="mt-3 text-center text-3xl uppercase text-mr-lime">Nominate</div>
      <div className="text-center text-xl">
        Nominations open on Mondays at 7pm ET. Vote for friends (or yourself) to get on a billboard in Times Square.{" "}
      </div>

      <div className="mt-3 text-center text-3xl uppercase text-mr-lime">Rack up Votes</div>
      <div className="text-center text-xl">
        Whoever has the most votes before Fridays at 11:59 PM ET will get their face on the next billboard.{" "}
      </div>

      <div className="mt-3 text-center text-3xl uppercase text-mr-lime">Get Mad Famous</div>
      <div className="text-center text-xl">
        Stop by this{" "}
        <Link href={"/map"} className="text-mr-sky-blue underline">
          billboard
        </Link>{" "}
        in Times Square on Sundays from 6-8pm to see this week’s winner revealed on the big screen.{" "}
      </div>

      <div className="mt-3 text-center text-3xl uppercase text-mr-lime">Repeat</div>
      <div className="text-center text-xl">This stage will be active for 2 weeks starting Monday, December 5th.</div>

      <div className="mt-3 text-center text-3xl uppercase text-mr-lime">Questions?</div>
      <div className="text-center text-xl">Text “HELP” to {formatPhoneNumber(CONTACT_PHONE_NUMBER)}.</div>
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
          <a href="https://my.community.com/madrealities?t=SUP" target="_blank" rel="noreferrer">
            <span className="text-xl font-regular uppercase tracking-wide">Get Updates</span>
          </a>
        </BillboardButton>
        <BillboardButton fill color="transparent" transparentAccent="mr-sky-blue">
          <a href="https://madrealities.xyz/" target="_blank" rel="noreferrer">
            <span className="text-xl font-regular uppercase tracking-wide">Learn More</span>
          </a>
        </BillboardButton>
      </div>
    </div>
  );

  const FOOTER = (
    <div className="my-2 flex flex-row gap-2">
      <SmallBillboardButton fill color="mr-sky-blue" className="w-auto">
        <Link href="/tcs">
          <span className="mx-10 text-sm font-regular uppercase tracking-wide">Terms</span>
        </Link>
      </SmallBillboardButton>
      <SmallBillboardButton fill color="mr-lime">
        <a href="https://my.community.com/madrealities?t=HELP" target="_blank" rel="noreferrer">
          <span className="mx-1 text-sm font-regular uppercase tracking-wide">Contact Support</span>
        </a>
      </SmallBillboardButton>
    </div>
  );

  return (
    <div className="align-center item-around flex h-full w-full grow flex-col items-center gap-2 p-3">
      {linkPreview}
      <Subheader>
        <span className="text-[18px] uppercase">You&apos;re here. You&apos;re there. You&apos;re everywhere</span>
      </Subheader>
      <div
        // className="relative h-[340px] w-full"
        className="relative  w-full"
      >
        <VideoPlayer playback_id="d7n3IuLlolLJ1gxNVnkWh8os2Vjyk8O009gsWvQOPXv4" />
        {/* <Image src="/cabs.png" alt="Mad Realities wordmark logo" fill /> */}
      </div>
      <Subheader flipped>
        <div className="text-right text-[19px] uppercase">You&apos;re on a billboard in Times Square</div>
      </Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/vote")}>
          <span className="text-2xl font-regular uppercase tracking-wide">Nominate</span>
        </BillboardButton>
        <BillboardButton fill color="transparent" onPress={() => router.push("/leaderboard")}>
          <span className="text-2xl font-regular uppercase tracking-wide">Leaderboard</span>
        </BillboardButton>
      </div>
      <Image src="/polygon.png" alt="Mad Realities wordmark logo" width={30} height={10} />
      {HOWITWORKS}
      {MADCTA}
      {FOOTER}
    </div>
  );
};

export default IndexPage;
