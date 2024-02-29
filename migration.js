import "dotenv/config";
import { gql, GraphQLClient } from "graphql-request";

const ghost_key = process.env.GHOST_KEY;
const ghost_url = process.env.GHOST_URL;

const hashnode_key = process.env.HASHNODE_PAT;

const migrate = async () => {
  const author = "jessica-wilkins";
  const posts = `${ghost_url}/posts/?key=${ghost_key}&filter=author:${author}`;

  let currentPage = 1;

  const response = await fetch(posts);

  if (response.status === 200) {
    const data = await response.json();

    for (const post of data.posts) {
      createNewPost(post);
    }
  } else {
    console.log("DIED AT FETCHING POSTS", response, "PAGE:", currentPage);
  }
};

const createNewPost = async (ghostPost) => {
  const { title, slug, html } = ghostPost;

  const formattedData = {
    publicationId: "64cb616d38b248b9c360ac8b",
    title: title,
    slug: slug,
    contentMarkdown: html,
  };

  const query = gql`
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          title
          slug,
        
        }
      }
    }
  `;

  const client = new GraphQLClient("https://gql.hashnode.com", {
    headers: {
      authorization: `Bearer ${hashnode_key}`,
    },
  });

  const data = await client.request(query, {
    input: formattedData,
  });

  console.log(data);
};

migrate();
