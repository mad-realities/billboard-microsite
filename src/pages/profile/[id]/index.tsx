import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CONTACT_PHONE_NUMBER, SQUAD } from "../../../client/constants";
import Image from "next/image";
import { Button } from "../../../components/design-system";
import { usePrivy } from "@privy-io/react-auth";
import { useWindowSize } from "../../../client/hooks";

const ProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;

  return <div className="flex w-full flex-col items-center text-white">{id && <ProfileCard id={id as string} />}</div>;
};

const ProfileCard = ({ id }: { id: string }) => {
  const { authenticated } = usePrivy();
  const sm = SQUAD[id];
  const size = useWindowSize();
  const margin = "m-5";
  const router = useRouter();

  const vote = () => {
    if (authenticated) {
      alert("nice, slay");
    } else {
      alert("hey? you need to login first");
    }
  };
  return (
    <div className="flex grow flex-col items-center justify-around rounded-xl text-3xl text-white">
      {/* <div className={`${margin}`}>
        <Button color={"mr-sky-blue"} size="lg" onPress={() => router.push(`/profile/${id}/edit`)}>
          Edit
        </Button>
      </div> */}
      <div className="w-500 h-600 sm:h-300 m-10 flex grow flex-col items-center justify-around gap-10 rounded-xl border bg-gradient-to-r from-mr-lilac to-mr-sky-blue text-3xl text-white">
        <Image
          src={sm.image}
          alt="Mad Realities wordmark logo"
          width={300}
          height={200}
          className={`rounded-lg ${margin} border-4`}
        />
        <div className={`${margin} text-4xl`}>{sm.name}</div>
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
