import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SQUAD } from "../../client/constants";
import Image from "next/image";
import { Button } from "../../components/design-system";
import { usePrivy } from "@privy-io/react-auth";

const ProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;

  return <div className="flex w-full flex-col items-center text-white">{id && <ProfileCard id={id as string} />}</div>;
};

const ProfileCard = ({ id }: { id: string }) => {
  const { authenticated } = usePrivy();
  const sm = SQUAD[id];
  const margin = "m-10";

  const vote = () => {
    if (authenticated) {
      alert("nice, slay");
    } else {
      alert("hey? you need to login first");
    }
  };
  return (
    <div className="w-500 h-600 m-10 flex grow flex-col items-center justify-around gap-10 rounded-xl border bg-gradient-to-r from-mr-lilac to-mr-sky-blue text-3xl text-white">
      <Image
        src={sm.image}
        alt="Mad Realities wordmark logo"
        width={300}
        height={200}
        className={`rounded-lg ${margin} border-4`}
      />
      <div className={`${margin} text-4xl`}>{sm.name}</div>
      <div className={`${margin}`}>
        <Button color={"mr-navy"} size="lg" onPress={() => vote()}>
          Vote
        </Button>
      </div>
    </div>
  );
};
export default ProfilePage;
