import Prismic from "prismic-javascript";

const REPOSITORY = "leya" || process.env.PRISMIC_REPOSITORY_NAME;
const REF_API_URL = `https://${REPOSITORY}.cdn.prismic.io/api/v2`;
const GRAPHQL_API_URL = `https://${REPOSITORY}.cdn.prismic.io/graphql`;
// export const API_URL = 'https://your-repo-name.cdn.prismic.io/api/v2'
export const API_TOKEN = process.env.PRISMIC_API_TOKEN || "";
export const API_LOCALE = process.env.PRISMIC_REPOSITORY_LOCALE || "en-us";

export const PrismicClient = Prismic.client(REF_API_URL, {
  accessToken: API_TOKEN,
});

async function fetchAPI(query, { previewData, variables } = {}) {
  const prismicAPI = await PrismicClient.getApi();
  const res = await fetch(
    `${GRAPHQL_API_URL}?query=${query}&variables=${JSON.stringify(variables)}`,
    {
      headers: {
        "Prismic-Ref": previewData?.ref || prismicAPI.masterRef.ref,
        "Content-Type": "application/json",
        "Accept-Language": API_LOCALE,
        Authorization: `Token ${API_TOKEN}`,
      },
    }
  );

  if (res.status !== 200) {
    console.log(await res.text());
    throw new Error("Failed to fetch API");
  }

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }
  return json.data;
}

export async function getAllBlogsWithSlug() {
  const data = await fetchAPI(`
    {
      allBlogs {
        edges {
          node {
            _meta {
              uid
            }
          }
        }
      }
    }
  `);

  /*
   convert data to [
     { params: { slug: 'blog-post-1' } },
   ] */

  let returnData = data?.allBlogs?.edges?.map((edge) => ({
    params: {
      id: edge.node._meta.uid || "null",
    },
  }));

  return returnData;
}

export async function getAllPostsForHome(previewData) {
  const data = await fetchAPI(
    `
    query {
      allBlogs(sortBy: date_DESC) {
        edges {
          node {
            title
            main
            date
            _meta {
              uid
            }
          }
        }
      }
    }
  `,
    { previewData }
  );

  return data.allBlogs.edges;
}

export async function getPostAndMorePosts(slug, previewData) {
  const data = await fetchAPI(
    `
  query BlogBySlug($slug: String!, $lang: String!) {
    blog(uid: $slug, lang: $lang) {
      title
      main
      date
      _meta {
        uid
      }
    }
  }
  `,
    {
      previewData,
      variables: {
        slug,
        lang: API_LOCALE,
      },
    }
  );

  // console.log("DATA: " + JSON.stringify(data));

  // data.moreBlogs = data.blog
  //   .filter(({ node }) => node._meta.uid !== slug)
  //   .slice(0, 2);

  return data.blog;
}
