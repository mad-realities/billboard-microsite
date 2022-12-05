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
import { mixpanelClient, VISITED_HOME } from "../client/mixpanel";
import { useEffect } from "react";

const IndexPage = () => {
  const router = useRouter();
  const linkPreview = getLinkPreview("LANDING");

  useEffect(() => {
    mixpanelClient.track(VISITED_HOME);
  }, []);

  const HOWITWORKS = (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-white p-10">
      <div className="text-4xl uppercase text-mr-yellow">How it Works</div>

      <div className="mt-3 text-center text-3xl uppercase text-mr-lime">Nominate</div>
      <div className="text-center text-xl">
        Nominate your friends (or yourself) for a chance to be featured on a billboard in Times Square.{" "}
      </div>

      <div className="mt-3 text-center text-3xl uppercase text-mr-lime">Rack up Votes</div>
      <div className="text-center text-xl">
        The higher the votes, the higher the chances, so make it to the top of the leaderboard by this Wednesday at 1 PM
        ET.{" "}
      </div>

      <div className="mt-3 text-center text-3xl uppercase text-mr-lime">Get Mad Famous</div>
      <div className="text-center text-xl">
        Winner’s face will go live on{" "}
        <Link href={"/map"} className="text-mr-sky-blue underline">
          the big screen in Times Square
        </Link>{" "}
        this Sunday from 6-8pm.{" "}
      </div>

      {/* <div className="mt-3 text-3xl text-center uppercase text-mr-lime">Repeat</div>
      <div className="text-xl text-center">This stage will be active for 2 weeks starting Monday, December 5th.</div> */}

      <div className="mt-3 text-center text-3xl uppercase text-mr-lime">Questions?</div>
      <div className="text-center text-xl">Text “HELP” to {formatPhoneNumber(CONTACT_PHONE_NUMBER)}.</div>
      <div className="text-center text-xl">*Terms and Conditions apply*</div>
    </div>
  );

  const MADCTA = (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-white p-3 pt-8">
      <div className="text-4xl text-mr-yellow">Reality is MAD</div>
      <div className="text-4xl text-mr-yellow">Join ours instead.</div>

      <div className="text-center text-xl">Mad Realities creates the stage, you influence the outcome.</div>

      <div className="text-center text-xl">
        Sign up for updates on future drops, IRL events, and other cool secrets.
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
        className="relative w-full"
      >
        <VideoPlayer playback_id="4hjuF700HM4CZsQLb3OKMSBmtA97SJ00aF565b9dR00Nv4" />
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
