import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchVerification = async () => {
      return await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      })
        .then((res) => res.text())
        .then((res) => {
          if (res !== "success") {
            router.push("/");
          } else {
            // See Router Control Flow Comment Below!
            setIsVerified(true);
          }
        });
    };

    if (ready && !authenticated) {
      router.push("/");
    } else if (ready && authenticated) {
      // Router Control Flow
      // This MUST be gated by an else statement. Theoretically router.push should exit the
      // control flow, but in practice there's a slight lag before the redirect. This allows
      // execution of the effect to continue, which could cause a flash of unauthenticated
      // content. Protecting the state change with an else statement prevents this.
      fetchVerification();
    }
  }, [router, user, ready, authenticated]);

  if (!ready) {
    return <div>Loading...</div>;
  } else if (authenticated && isVerified) {
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard;
