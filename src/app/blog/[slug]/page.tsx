import { roboto } from "@/app/fonts";
import { getPostsSortedByDate } from "@/lib/posts";
import { format, parseISO } from "date-fns";

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
      <h1 className="pb-5">{metaData.title}</h1>
      <div
        className={`${roboto.className} mt-8 mb-12 inline-block pt-2 border-t-2 border-gray-400 text-sm`}
      >
        <span className="font-bold uppercase">Published:</span>{" "}
        {format(parseISO(metaData.date), "LLLL d, yyyy")}
      </div>
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
