import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CONTACT_PHONE_NUMBER, SQUAD } from "../../../client/constants";
import Image from "next/image";
import { Button } from "../../../components/design-system";
import { useWindowSize } from "../../../client/hooks";
import { InstagramEmbed } from "react-social-media-embed";
import BillboardButton from "../../../components/design-system/BillboardButton";
import Subheader from "../../../components/design-system/Subheader";

const ProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;

  return <div className="flex w-full flex-col items-center text-white">{id && <ProfileCard id={id as string} />}</div>;
};

const ProfileCard = ({ id }: { id: string }) => {
  const sm = SQUAD[id];
  const size = useWindowSize();
  const margin = "m-5";
  const router = useRouter();

  return (
    <div className="flex grow flex-col items-center justify-around rounded-xl text-3xl text-white">
      <Subheader>
        <div>Profile</div>
      </Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow">
          NOMINATE
        </BillboardButton>
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/leaderboard")}>
          LEADERBOARD
        </BillboardButton>
      </div>
      <div className="align-center m-2 flex flex-col items-center justify-center gap-10 rounded-xl border border-white p-10">
        <div className="text-xl2">
          <a>
            <span className="text-mr-yellow underline">@{id}</span>
          </a>
          <span> is in...</span>
        </div>

        <div className="text-center text-xl">2. The more nomintations the higher chances</div>
        <div className="text-xl">3. See your friend on the big screen</div>
        <div className="flex w-full flex-row gap-2">
          <BillboardButton fill color="mr-sky-blue">
            <a href={`sms:${CONTACT_PHONE_NUMBER}?&body=VOTE:${id}`}>VOTE</a>
          </BillboardButton>
          <BillboardButton fill color="mr-sky-blue" onPress={() => router.push("/leaderboard")}>
            SHARE
          </BillboardButton>
        </div>
      </div>
      {/* <div className={`${margin}`}>
        <Button color={"mr-sky-blue"} size="lg" onPress={() => router.push(`/profile/${id}/edit`)}>
          Edit
        </Button>
      </div> */}
      <div className="">
        {/* <InstagramEmbed url={`https://www.instagram.com/${id}`} width={328} /> */}

        {/* <div className={`${margin} text-4xl`}>{id}</div> */}
        <div className={`${margin}`}>
          <a href={`sms:${CONTACT_PHONE_NUMBER}?&body=VOTE:${id}`}>
            <Button color={"mr-navy"} size="lg">
              Vote
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
