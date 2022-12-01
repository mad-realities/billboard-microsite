import { useRouter } from "next/router";
import Image from "next/image";
import { useWindowSize } from "../client/hooks";
import BillboardButton from "../components/design-system/BillboardButton";
import Subheader from "../components/design-system/Subheader";

const IndexPage = () => {
  const router = useRouter();

  return (
    <div className="align-center item-around flex h-full w-full grow flex-col items-center gap-2 p-3 text-white">
      <Subheader>
        <span className="text-[18px] uppercase">You're here. You're there. You're everywhere.</span>
      </Subheader>
      <div className="relative h-[340px] w-full">
        <Image src="/cabs.png" alt="Mad Realities wordmark logo" fill />
      </div>
      <Subheader flipped>
        <div className="text-right text-[19px] uppercase">You're on a billboard in Times Square.</div>
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
      <ol className="list-inside list-decimal text-center text-xl">
        <li className="m-4">Nominate your friend</li>
        <li className="m-4">The more nomintations the higher chances</li>
        <li className="m-4">See your friend on the big screen</li>
      </ol>
    </div>
  );
};

export default IndexPage;
