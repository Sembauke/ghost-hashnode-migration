import "dotenv/config";
import { gql, GraphQLClient } from "graphql-request";

const ghost_key = process.env.GHOST_KEY;
const ghost_url = process.env.GHOST_URL;

const publicationId = process.env.HASHNODE_PUBLICATION_ID;

const hashnode_key = process.env.HASHNODE_PAT;

let currentPage = 1;

const migrate = async (page) => {
  const author = "jessica-wilkins";
  const posts = `${ghost_url}/posts/?key=${ghost_key}&filter=author:${author}&include=tags&page=${page}`;

  // TODO - add error handling
  const response = await fetch(posts);
  const data = await response.json();

  const totalPages = data.meta.pagination.pages;

  for (const post of data.posts) {
    createNewPost(post);
  }
  currentPage++;

  if(currentPage <= totalPages) {
    migrate(currentPage);
  }
};

const createNewPost = async (ghostPost) => {
  const { title, slug, html, feature_image, published_at, tags } = ghostPost;

  const formattedData = {
    publicationId: publicationId,
    title: title,
    slug: slug,
    contentMarkdown: html,
    publishedAt: published_at,
    coverImageOptions: {
      coverImageURL: feature_image,
    },
    // TODO: tags need to be added to hashnode blog.
    // tags: [
    //   ...tags.map((tag) => {
    //     return {
    //       id: tag.id,
    //       slug: tag.slug,
    //       name: tag.name
    //     }
    //   })
    // ],
  };

  const query = gql`
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          title
          slug
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

migrate(1);
