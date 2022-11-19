import { PrivyProvider, User } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { graphql, useMutation } from "react-relay";

import { PrivyRelayProviderCreateUserMutation } from "../../__generated__/PrivyRelayProviderCreateUserMutation.graphql";

const createUserMutation = graphql`
  mutation PrivyRelayProviderCreateUserMutation($userId: ID!, $walletAddress: String) {
    createOrUpdateUser(id: $userId, wallet_address: $walletAddress) {
      id
    }
  }
`;

interface PrivyRelayProviderProps {
  children: JSX.Element;
}

function PrivyRelayProvider({ children }: PrivyRelayProviderProps) {
  const [commitMutation] = useMutation<PrivyRelayProviderCreateUserMutation>(createUserMutation);
  const router = useRouter();

  const handleLogin = async (user: User) => {
    await commitMutation({
      variables: {
        userId: user.id,
        walletAddress: user.wallet?.address,
      },
      onCompleted: () => {
        router.push(`/home`);
      },
    });
  };

  return (
    <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID} onSuccess={handleLogin}>
      {children}
    </PrivyProvider>
  );
}

export default PrivyRelayProvider;
