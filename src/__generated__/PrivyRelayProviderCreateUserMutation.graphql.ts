/**
 * @generated SignedSource<<ab92237c2c29826f6d6b2d1d029d2b0d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from "relay-runtime";
export type PrivyRelayProviderCreateUserMutation$variables = {
  userId: string;
  walletAddress?: string | null;
};
export type PrivyRelayProviderCreateUserMutation$data = {
  readonly createOrUpdateUser: {
    readonly id: string;
  };
};
export type PrivyRelayProviderCreateUserMutation = {
  response: PrivyRelayProviderCreateUserMutation$data;
  variables: PrivyRelayProviderCreateUserMutation$variables;
};

const node: ConcreteRequest = (function () {
  var v0 = [
      {
        defaultValue: null,
        kind: "LocalArgument",
        name: "userId",
      },
      {
        defaultValue: null,
        kind: "LocalArgument",
        name: "walletAddress",
      },
    ],
    v1 = [
      {
        alias: null,
        args: [
          {
            kind: "Variable",
            name: "id",
            variableName: "userId",
          },
          {
            kind: "Variable",
            name: "wallet_address",
            variableName: "walletAddress",
          },
        ],
        concreteType: "User",
        kind: "LinkedField",
        name: "createOrUpdateUser",
        plural: false,
        selections: [
          {
            alias: null,
            args: null,
            kind: "ScalarField",
            name: "id",
            storageKey: null,
          },
        ],
        storageKey: null,
      },
    ];
  return {
    fragment: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Fragment",
      metadata: null,
      name: "PrivyRelayProviderCreateUserMutation",
      selections: v1 /*: any*/,
      type: "Mutation",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Operation",
      name: "PrivyRelayProviderCreateUserMutation",
      selections: v1 /*: any*/,
    },
    params: {
      cacheID: "ff0b302089c6206935d8125af90b6b53",
      id: null,
      metadata: {},
      name: "PrivyRelayProviderCreateUserMutation",
      operationKind: "mutation",
      text: "mutation PrivyRelayProviderCreateUserMutation(\n  $userId: ID!\n  $walletAddress: String\n) {\n  createOrUpdateUser(id: $userId, wallet_address: $walletAddress) {\n    id\n  }\n}\n",
    },
  };
})();

(node as any).hash = "12fce51179ca53f538ff07a9cf7d1282";

export default node;
