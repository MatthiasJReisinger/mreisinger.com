import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Post, getPostsSortedByDate } from "@/lib/posts";

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-1 text-xl">
        <Link
          href={`/blog/${post.postId}`}
          className="text-blue-700 hover:text-blue-900 dark:text-blue-400"
        >
          {post.metaData.title}
        </Link>
      </h2>
      <time
        dateTime={post.metaData.date}
        className="mb-2 block text-xs text-gray-600"
      >
        {format(parseISO(post.metaData.date), "LLLL d, yyyy")}
      </time>
    </div>
  );
}

export default async function Page() {
  const posts = await getPostsSortedByDate();
  console.log(posts);

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-8 text-center text-2xl font-black">
        Next.js + Contentlayer Example
      </h1>
      {posts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </div>
  );
}
