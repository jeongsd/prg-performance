import http from "k6/http";
import { sleep, check } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
  executor: "ramping-arrival-rate", //Assure load increase if the system slows
  stages: [
    // Breakpoint testing
    { duration: "10s", target: 300 },
    { duration: "1m", target: 300 },
    { duration: "10s", target: 0 },
  ],
  // vus: 50, // Set number of virtual users
};

const BASE_URL = "http://localhost:3000/graphql";

function createUser() {
  let username = randomString(10);
  let email = `user-${randomString(10)}@artillery.io`;
  let mutation = `
        mutation CreateUser($createUserInput: UserInput!) {
            createUser(input: $createUserInput) {
                id
            }
        }`;
  let variables = {
    createUserInput: {
      username: username,
      email: email,
    },
  };
  let headers = {
    "Content-Type": "application/json",
  };
  let body = JSON.stringify({ query: mutation, variables: variables });
  let response = http.post(BASE_URL, body, { headers: headers });
  check(response, { "created user": (r) => r.status === 200 });
  return JSON.parse(response.body).data.createUser.id;
}

export default function () {
  let userId = createUser();

  // Fetch user details
  let userQuery = `
        query UserQuery($userId: ID!) {
            user(id: $userId) {
                username
                email
            }
        }`;
  http.post(
    BASE_URL,
    JSON.stringify({
      query: userQuery,
      variables: { userId: userId },
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  // Create multiple posts
  for (let i = 0; i < 10; i++) {
    let createPost = `
            mutation CreatePost($createPostInput: PostInput!) {
                createPost(input: $createPostInput) {
                    id
                }
            }`;
    http.post(
      BASE_URL,
      JSON.stringify({
        query: createPost,
        variables: {
          createPostInput: {
            authorId: userId,
            title: randomString(10),
            content: randomString(20),
          },
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Fetch posts
  let postsQuery = `
        query Posts {
            posts(first: 1000) {
                edges {
                    node {
                        id
                        title
                        content
                    }
                }
            }
        }`;
  http.post(BASE_URL, JSON.stringify({ query: postsQuery }), {
    headers: { "Content-Type": "application/json" },
  });

  // Sleep between iterations
  sleep(1);
}
