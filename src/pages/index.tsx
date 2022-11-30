import { useRouter } from "next/router";
import Image from "next/image";
import { useWindowSize } from "../client/hooks";
import BillboardButton from "../components/design-system/BillboardButton";
import Subheader from "../components/design-system/Subheader";

const IndexPage = () => {
  const router = useRouter();
  // useEffect(() => {
  //   const { pathname } = router;
  //   if (pathname == "/") {
  //     router.push("/leaderboard");
  //   }
  // }, []);

  return (
    <div className="align-center item-around flex h-full w-auto flex-grow grow flex-col items-center gap-1 p-1 text-white">
      <Subheader>
        <div className="text-sm">YOU’RE HERE. YOU’RE THERE. YOU’RE EVERYWHERE.</div>
      </Subheader>
      <Image src="/cabs.png" alt="Mad Realities wordmark logo" width={400} height={300} />
      <Subheader>
        <div className="text-sm font-semibold">WHOSE FACE WILL END UP AROUND NYC ON SUNDAY?</div>
      </Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/vote")}>
          NOMINATE
        </BillboardButton>
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/leaderboard")}>
          LEADERBOARD
        </BillboardButton>
      </div>
      <Image src="/polygon.png" alt="Mad Realities wordmark logo" width={30} height={10} />
      <div className="align-center m-2 flex flex-col items-center justify-center gap-10 rounded-xl border border-white p-10 font-semibold">
        <div className="text-xl">1. Nominate your friend</div>
        <div className="text-center text-xl">2. The more nomintations the higher chances</div>
        <div className="text-xl">3. See your friend on the big screen</div>
      </div>
    </div>
  );
};

export default IndexPage;
