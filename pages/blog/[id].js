const Prismic = require("@prismicio/client");
import { getAllBlogsWithSlug, getPostAndMorePosts } from "../../lib/prismic";
import Head from "next/head";
import ErrorPage from "next/error";
import { useRouter } from "next/router";

export async function getStaticProps({ params, preview = false, previewData }) {
  const data = await getPostAndMorePosts(params.slug || params.id, previewData);
  console.log("JSON: " + JSON.stringify(data));
  return {
    props: {
      blog: data ?? null,
    },
  };
}

export async function getStaticPaths() {
  const allPosts = await getAllBlogsWithSlug();

  console.log("paths: " + JSON.stringify(allPosts));
  return {
    paths: allPosts || [],
    fallback: true,
  };
}

export default function Post({ post, blog }) {
  const router = useRouter();
  if (!router.isFallback && !blog?._meta?.uid) {
    return (
      <h1>
        "{blog?._meta?.uid}" statusCode={404}
      </h1>
    );
  }

  return (
    <div>
      <div>
        {router.isFallback ? (
          <h1>Loading…</h1>
        ) : (
          <>
            <article>
              <Head>
                <title>
                  {blog.title[0].text} | Next.js Blog Example with {"CMS_NAME"}
                </title>
                <meta property="og:image" />
              </Head>
              <div
                title={blog.title}
                coverImage={blog.coverimage}
                date={blog.date}
                author={blog.author}
              />
            <h1>{blog.main[0]}</h1>
            </article>
          </>
        )}
      </div>
    </div>
  );
}
