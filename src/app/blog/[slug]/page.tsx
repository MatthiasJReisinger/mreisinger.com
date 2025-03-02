import { getPostsSortedByDate } from "@/lib/posts";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const { default: Post } = await import(`@/posts/${slug}/index.mdx`);

  return <Post />;
}

export async function generateStaticParams() {
  const posts = await getPostsSortedByDate();
  return posts.map((post) => {
    return { slug: post.postId };
  });
}

export const dynamicParams = false;
