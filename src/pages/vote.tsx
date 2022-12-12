import { useRouter } from "next/router";
import BillboardButton from "../components/design-system/BillboardButton";
import Subheader from "../components/design-system/Subheader";
import { useEffect, useState } from "react";
import { getSmsHref } from "../client/stringUtils";
import { getLinkPreview } from "../linkPreviewConfig";
import { mixpanelClient, VISITED_NOMINATE } from "../client/mixpanel";

const Vote = () => {
  const router = useRouter();
  const [handle, setHandle] = useState("madrealities");
  const [error, setError] = useState("");
  const linkPreview = getLinkPreview("VOTE");

  // check if handle is one word
  const handleIsValid = handle.split(" ").length === 1;
  useEffect(() => {
    mixpanelClient.track(VISITED_NOMINATE);
  }, []);

  useEffect(() => {
    if (handleIsValid) {
      setError("");
    } else {
      setError("Instagram handle must be valid!");
    }
  }, [handleIsValid]);

  return (
    <div className="align-center item-around flex h-full w-full grow flex-col items-center gap-3 p-1 text-mr-offwhite">
      {linkPreview}
      <Subheader>
        <div className="text-[18px] uppercase">Nominate your friend to be on the billboard</div>
      </Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/leaderboard")}>
          LEADERBOARD
        </BillboardButton>
        <BillboardButton fill color="transparent" onPress={() => router.push("/check")}>
          CHECK RANK
        </BillboardButton>
      </div>
      <div className="text-center text-xl uppercase">Whose face should be on a billboard in Times Square?</div>
      <div className="flex w-3/4 flex-col gap-2">
        <input
          placeholder="enter instagram username here"
          onInput={(e) => setHandle(e.currentTarget.value)}
          className=" block w-full rounded-lg border border-4 border-double border-mr-offwhite bg-transparent p-2.5 text-center text-sm text-mr-offwhite placeholder-mr-offwhite"
        />
        <BillboardButton fill color="mr-sky-blue" rightIcon="ArrowRight">
          {handleIsValid ? (
            <a
              href={getSmsHref(handle)}
              className="w-full uppercase"
              onClick={() => {
                if (handleIsValid) {
                  router.push("/profile/" + handle);
                }
              }}
            >
              Text to cast vote
            </a>
          ) : (
            <>Text to cast vote</>
          )}
        </BillboardButton>
      </div>
      <span className="text-mr-pink"> {error} </span>
    </div>
  );
};

export default Vote;
