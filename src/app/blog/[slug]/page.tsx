import { getPostsSortedByDate } from "@/lib/posts";

import "highlight.js/styles/stackoverflow-dark.css";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const { metaData, default: Post } = await import(`@/posts/${slug}/index.mdx`);

  return (
    <div>
      <h1 className="text-2xl font-bold pb-5">{metaData.title}</h1>
      <Post />
    </div>
  );
}

export async function generateStaticParams() {
  const posts = await getPostsSortedByDate();
  return posts.map((post) => {
    return { slug: post.postId };
  });
}

export const dynamicParams = false;
