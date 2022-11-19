import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";

const IndexPage = () => {
  const router = useRouter();
  useEffect(() => {
    const { pathname } = router;
    if (pathname == "/") {
      router.push("/leaderboard");
    }
  }, []);

  return <div>Holup</div>;
};

export default IndexPage;
