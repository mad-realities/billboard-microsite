import { Environment, FetchFunction, Network, RecordSource, Store, Variables } from "relay-runtime";
import { GRAPHQL_ENDPOINT } from "./constants";

// Due to Next pre-rendering, we can only create the Relay environment when cookies are actually
// present, i.e. in an actual user session. Hence, we wrap environment creation in a no-arg func
// that gets invoked in _app.tsx.
const createRelayEnvironment = () => {
  const fetchGraphQL = async (text: string | null | undefined, variables: Variables) => {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: text,
        variables,
      }),
    });
    return await response.json();
  };

  const fetchRelay: FetchFunction = async (params, variables) => {
    return fetchGraphQL(params.text, variables);
  };

  return new Environment({
    network: Network.create(fetchRelay),
    store: new Store(new RecordSource()),
  });
};

export default createRelayEnvironment;
