import http from "k6/http";
import { sleep, check } from "k6";
import { sha256 } from "k6/crypto";

import { randomString } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

function generateAPQHash(query) {
  return sha256(query, "hex");
}

const GRAPHQL_ENDPOINT = "http://localhost:3000/graphql";

function performQuery(query, variables = {}, operationName = null) {
  const queryHash = generateAPQHash(query);
  let body = JSON.stringify({
    operationName: operationName,
    variables: variables,
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: queryHash,
      },
    },
  });

  // Initial request with the APQ hash
  let headers = { "Content-Type": "application/json" };
  let response = http.post(GRAPHQL_ENDPOINT, body, { headers: headers });
  let jsonResponse = JSON.parse(response.body);

  // Check if server has requested the full query
  if (
    jsonResponse.errors
    // &&
    // jsonResponse.errors.some((e) => e.message === "PersistedQueryNotFound")
  ) {
    // Resend with full query text
    body = JSON.stringify({
      query: query,
      operationName: operationName,
      variables: variables,
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: queryHash,
        },
      },
    });
    response = http.post(GRAPHQL_ENDPOINT, body, { headers: headers });
    jsonResponse = JSON.parse(response.body);
  } else {
    // console.log("is hit");
  }

  check(response, {
    "is status 200": (r) => r.status === 200,
    "is data returned": (r) => r.json().data != null,
  });

  return jsonResponse;
}

export let options = {
  stages: [
    { duration: "10s", target: 200 },
    { duration: "1m", target: 200 },
    { duration: "10s", target: 0 },
  ],
};

export default function () {
  let username = randomString(10);
  let email = `user-${randomString(10)}@artillery.io`;

  let createUserQuery = `
    mutation CreateUser($username: String!, $email: String!) {
      createUser(input: {username: $username, email: $email}) {
        id
      }
    }
  `;
  let createUserResult = performQuery(
    createUserQuery,
    { username, email },
    "CreateUser"
  );
  // console.log(JSON.stringify(createUserResult, null, " "));
  const userId = createUserResult.data.createUser.id;

  let createPostQuery = `
    mutation CreatePost($authorId: ID!, $title: String!, $content: String!) {
      createPost(input: {authorId: $authorId, title: $title, content: $content}) {
        id
      }
    }
  `;
  let createPostResult = performQuery(
    createPostQuery,
    { authorId: userId, title: randomString(10), content: randomString(20) },
    "CreatePost"
  );
  const postId = createPostResult.data.createPost.id;

  performQuery(
    `fragment UserFragment on User {
        id
        email
        username
        email
        posts {
          comments {
            author {
              id
            }
          }
        }
      }

      fragment PostFragment on Post {
        id
        title
        author {
          id
          email
          ...UserFragment
          posts {
            comments {
              author {
                id
              }
            }
          }
        }
      }

      query Query($userId: ID!, $postId: ID!) {
        user(id: $userId) {
          ...UserFragment
        }
        posts {
          edges {
            node {
              ...PostFragment
            }
          }
        }
        post(id: $postId) {
          id
          title
          ...PostFragment
          author {
            id
            email
            ...UserFragment
            posts {
              ...PostFragment
              comments {
                author {
                  id
                }
              }
            }
          }
        }
      }`,
    {
      userId,
      postId,
    },
    "Query"
  );

  sleep(1); // Sleep between iterations
}
